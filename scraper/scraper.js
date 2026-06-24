/**
 * scraper.js — Scraper principal de notas de parche de Overwatch
 * 
 * Uso:
 *   node scraper.js                    → Descarga el parche más reciente
 *   node scraper.js --patch=latest     → Igual
 *   node scraper.js --no-translate     → Sin traducción (solo EN)
 *   node scraper.js --url=<url>        → URL específica
 * 
 * Requisitos:
 *   npm install
 * 
 * Variables de entorno opcionales:
 *   LIBRETRANSLATE_URL  → URL de tu instancia de LibreTranslate (default: https://libretranslate.com)
 *   LIBRETRANSLATE_KEY  → API key (opcional para instancias públicas)
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const yargs = require('yargs');

const { parseHTML } = require('./parser');
const { translateSection, translateBatch, initTranslator } = require('./translator');

// ─── Configuración ────────────────────────────────────────────────────────────

const BLIZZARD_PATCH_NOTES_URL = 'https://overwatch.blizzard.com/en-us/news/patch-notes/';
const DATA_DIR = path.join(__dirname, '..', 'data');
const PATCHES_DIR = path.join(DATA_DIR, 'patches');
const PATCHES_INDEX = path.join(DATA_DIR, 'patches_index.json');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg, type = 'info') {
    const icons = { info: 'ℹ️ ', success: '✅', error: '❌', warn: '⚠️ ' };
    console.log(`${icons[type] || '  '} ${msg}`);
}

function getPatchId(date) {
    // Formato: YYYY-MM-DD
    return date;
}

function getPatchDir(patchId) {
    return path.join(PATCHES_DIR, patchId);
}

/**
 * Descarga la página de patch notes de Blizzard.
 */
async function fetchPatchPage(url) {
    log(`Descargando: ${url}`);
    try {
        const response = await axios.get(url, {
            headers: HEADERS,
            timeout: 30000,
            // Algunos sitios requieren esto para evitar redirecciones
            maxRedirects: 5
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
        }
        throw new Error(`Error de red: ${error.message}`);
    }
}

/**
 * Extrae la fecha del parche más reciente de la página de índice.
 */
function extractLatestPatchDate($) {
    // Intentar extraer del título o metadatos
    const title = $('title').text();
    const dateMatch = title.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
    if (dateMatch) {
        return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    }

    // Intentar extraer del texto de la página
    const bodyText = $('body').text();
    const bodyDateMatch = bodyText.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+(\d{4})\b/i);
    if (bodyDateMatch) {
        const months = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
        const month = months[bodyDateMatch[1].toLowerCase()];
        const year = bodyDateMatch[2];
        return `${year}-${String(month).padStart(2, '0')}-01`;
    }

    // Fallback: fecha actual
    return new Date().toISOString().split('T')[0];
}

/**
 * Actualiza el índice de parches (patches_index.json).
 */
async function updatePatchesIndex(patchMeta) {
    let index = { patches: [] };

    if (await fs.pathExists(PATCHES_INDEX)) {
        index = await fs.readJson(PATCHES_INDEX);
    }

    // Marcar todos como no-latest inicialmente
    index.patches = index.patches.map(p => ({ ...p, isLatest: false }));

    // Verificar si ya existe
    const existingIdx = index.patches.findIndex(p => p.id === patchMeta.id);
    if (existingIdx >= 0) {
        index.patches[existingIdx] = { ...index.patches[existingIdx], ...patchMeta };
    } else {
        index.patches.unshift(patchMeta);
    }

    // Ordenar por fecha descendente
    index.patches.sort((a, b) => b.date.localeCompare(a.date));

    // Establecer el primero como el último (isLatest: true)
    if (index.patches.length > 0) {
        index.patches[0].isLatest = true;
    }

    await fs.writeJson(PATCHES_INDEX, index, { spaces: 2 });
    log(`Índice actualizado: ${index.patches.length} parches`, 'success');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    const argv = yargs
        .option('url', { type: 'string', description: 'URL específica del parche' })
        .option('patch', { type: 'string', default: 'latest', description: 'ID del parche (ej: 2026-06-23) o "latest"' })
        .option('translate', { type: 'boolean', default: true, description: 'Traducción automática al español' })
        .option('stadium', { type: 'boolean', default: true, description: 'Incluir cambios de Stadium' })
        .option('general', { type: 'boolean', default: true, description: 'Incluir cambios de Juego Base / General' })
        .option('force', { type: 'boolean', default: false, description: 'Forzar descarga y traducción completa ignorando la caché' })
        .option('output', { type: 'string', description: 'Directorio de salida personalizado' })
        .help()
        .argv;

    const targetUrl = argv.url || BLIZZARD_PATCH_NOTES_URL;
    const translate = argv.translate;
    const skipStadium = argv.stadium === false;
    const skipGeneral = argv.general === false;

    console.log('\n🎮 Overwatch Patch Notes Scraper');
    console.log('================================\n');

    try {
        // 1. Descargar HTML
        log('Paso 1/5: Descargando página de Blizzard...');
        const html = await fetchPatchPage(targetUrl);

        // 2. Parsear HTML
        log('Paso 2/5: Parseando HTML...');
        const $ = cheerio.load(html);
        let defaultPatchDate;
        const urlDateMatch = targetUrl.match(/\/(\d{4})\/(\d{2})/);
        if (urlDateMatch) {
            defaultPatchDate = `${urlDateMatch[1]}-${urlDateMatch[2]}-01`;
            log(`Fecha base de la URL: ${defaultPatchDate}`, 'info');
        } else {
            defaultPatchDate = extractLatestPatchDate($);
        }

        const patches = parseHTML(html, defaultPatchDate);
        log(`Se detectaron ${patches.length} parches en el documento.`, 'success');

        // Procesar cada parche
        for (let i = 0; i < patches.length; i++) {
            const patchData = patches[i];
            const patchId = getPatchId(patchData.date);

            console.log(`\n--------------------------------------------------`);
            const versionStr = patchData.version && patchData.version !== 'unknown' ? ` (v${patchData.version})` : '';
            log(`Procesando parche ${i + 1}/${patches.length}: ${patchId}${versionStr}`);

            const outputDir = argv.output || getPatchDir(patchId);
            const patchJsonPath = path.join(outputDir, 'patch.json');

            let existingPatchData = null;
            if (await fs.pathExists(patchJsonPath)) {
                try {
                    existingPatchData = await fs.readJson(patchJsonPath);
                    log(`Datos anteriores encontrados para el parche ${patchId}.`, 'info');
                } catch (err) {
                    log(`No se pudo leer el archivo existente: ${err.message}`, 'warn');
                }
            }

            if (skipStadium) {
                log('Ignorando cambios de Stadium por petición (--no-stadium). Preservando anteriores...', 'info');
                if (existingPatchData && existingPatchData.sections && existingPatchData.sections.stadium) {
                    patchData.sections.stadium = existingPatchData.sections.stadium;
                } else {
                    patchData.sections.stadium = { intro: 'Sección omitida por petición.', roles: { 'Tanque': [], 'Daño': [], 'Apoyo': [] }, generalItems: [] };
                }
            }

            if (skipGeneral) {
                log('Ignorando cambios de Juego Base (General) por petición (--no-general). Preservando anteriores...', 'info');
                if (existingPatchData && existingPatchData.sections) {
                    if (existingPatchData.sections.gameBase) patchData.sections.gameBase = existingPatchData.sections.gameBase;
                    if (existingPatchData.sections.maps) patchData.sections.maps = existingPatchData.sections.maps;
                    if (existingPatchData.sections.system) patchData.sections.system = existingPatchData.sections.system;
                    if (existingPatchData.sections.bugFixes) patchData.sections.bugFixes = existingPatchData.sections.bugFixes;
                } else {
                    patchData.sections.gameBase = { intro: 'Sección omitida por petición.', roles: { 'Tanque': [], 'Daño': [], 'Apoyo': [] } };
                    patchData.sections.maps = [];
                    patchData.sections.system = [];
                    patchData.sections.bugFixes = [];
                }
            }

            const alreadyTranslated = !argv.force && existingPatchData && existingPatchData.translated;

            // 3. Traducir (opcional)
            if (translate) {
                if (alreadyTranslated) {
                    log(`El parche ${patchId} ya está traducido en el archivo local. Reutilizando traducción...`, 'success');
                    patchData.sections = existingPatchData.sections;
                    patchData.translated = true;
                } else {
                    log('Traduciendo al español...');
                    await initTranslator();

                    // Contar total de elementos a traducir para mostrar progreso
                    let totalToTranslate = 0;
                    let translatedCount = 0;

                    function countSectionItems(section) {
                        let count = 0;
                        if (section) {
                            if (section.intro) count++;
                            if (section.roles) {
                                for (const heroes of Object.values(section.roles)) {
                                    count += heroes.length;
                                }
                            }
                            if (section.generalItems) {
                                count += section.generalItems.length;
                            }
                        }
                        return count;
                    }

                    if (!skipStadium) {
                        totalToTranslate += countSectionItems(patchData.sections.stadium);
                    }
                    if (!skipGeneral && patchData.sections.gameBase) {
                        totalToTranslate += countSectionItems(patchData.sections.gameBase);
                    }
                    if (patchData.sections.bugFixes && patchData.sections.bugFixes.length > 0) {
                        totalToTranslate += patchData.sections.bugFixes.length;
                    }

                    const onProgress = () => {
                        translatedCount++;
                        // Imprimir para control interno del progress bar (invisible en la consola del frontend)
                        console.log(`TRADUCCION_PROGRESO: ${translatedCount}/${totalToTranslate}`);
                        // Imprimir para mostrar en la consola amigable del usuario
                        log(`Traducción: ${translatedCount}/${totalToTranslate} elementos (${Math.round((translatedCount / totalToTranslate) * 100)}%)`, 'info');
                    };

                    log(`Total de elementos a traducir: ${totalToTranslate}`, 'info');

                    try {
                        if (!skipStadium) {
                            patchData.sections.stadium = await translateSection(patchData.sections.stadium, onProgress);
                        }
                        if (!skipGeneral && patchData.sections.gameBase) {
                            patchData.sections.gameBase = await translateSection(patchData.sections.gameBase, onProgress);
                        }
                        if (patchData.sections.bugFixes && patchData.sections.bugFixes.length > 0) {
                            log('Traduciendo corrección de errores (Bug Fixes)...');
                            patchData.sections.bugFixes = await translateBatch(patchData.sections.bugFixes, onProgress);
                        }
                        patchData.translated = true;
                        log('Traducción completada con éxito.', 'success');
                    } catch (transError) {
                        log(`Error en traducción: ${transError.message}. Continuando sin traducir.`, 'warn');
                    }
                }
            } else {
                log('Traducción desactivada (--no-translate)');
            }

            // 4. Guardar archivos
            log('Guardando archivos de datos...', 'info');
            await fs.ensureDir(outputDir);

            // patch.json
            await fs.writeJson(patchJsonPath, patchData, { spaces: 2 });
            log('Datos del parche guardados correctamente.', 'success');

            // meta.json
            const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const [year, month, day] = patchData.date.split('-');
            const metaData = {
                version: patchData.version,
                date: patchData.date,
                title: `Actualización del ${parseInt(day, 10)} de ${months[parseInt(month, 10) - 1]} ${year}`,
                subtitle: 'Notas de parche oficiales de Overwatch',
                url: targetUrl,
                season: 'Temporada actual'
            };

            const metaJsonPath = path.join(outputDir, 'meta.json');
            await fs.writeJson(metaJsonPath, metaData, { spaces: 2 });
            log('Metadatos e información general guardados.', 'success');

            // 5. Actualizar índice
            log('Actualizando índice de parches...');
            await updatePatchesIndex({
                id: patchId,
                ...metaData,
                dataPath: `data/patches/${patchId}/patch.json`
            });
        }

        console.log('\n🎉 ¡Proceso de scraping finalizado exitosamente!');
        console.log('\nLos cambios se han guardado y están listos para visualizar.\n');

    } catch (error) {
        // Verificar si es un error 404 de una URL mensual
        const monthlyUrlMatch = targetUrl.match(/\/live\/(\d{4})\/(\d{2})/);
        if (monthlyUrlMatch && error.message.includes('404')) {
            const year = monthlyUrlMatch[1];
            const month = monthlyUrlMatch[2];
            const patchId = `${year}-${month}-01`;
            const outputDir = argv.output || getPatchDir(patchId);
            const patchJsonPath = path.join(outputDir, 'patch.json');
            const metaJsonPath = path.join(outputDir, 'meta.json');
            
            log(`⚠️ No se encontraron notas de parche en Blizzard para ${year}-${month} (HTTP 404). Creando marcador de mes sin parches...`, 'warn');
            
            const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const title = `Actualización de ${months[parseInt(month, 10) - 1]} ${year}`;
            
            const emptyPatch = {
                version: "—",
                date: patchId,
                title: `${title} (Sin actualizaciones)`,
                sections: {
                    gameBase: { intro: "No hubo parches publicados por Blizzard en este mes.", roles: { 'Tanque': [], 'Daño': [], 'Apoyo': [] } },
                    stadium: { intro: "", roles: { 'Tanque': [], 'Daño': [], 'Apoyo': [] }, generalItems: [] },
                    bugFixes: []
                },
                translated: true,
                isEmptyPlaceholder: true
            };
            
            const metaData = {
                version: "—",
                date: patchId,
                title: `${title} (Sin actualizaciones)`,
                subtitle: 'No se publicaron notas de parche en este mes.',
                url: targetUrl,
                season: '—'
            };
            
            await fs.ensureDir(outputDir);
            await fs.writeJson(patchJsonPath, emptyPatch, { spaces: 2 });
            await fs.writeJson(metaJsonPath, metaData, { spaces: 2 });
            
            await updatePatchesIndex({
                id: patchId,
                ...metaData,
                dataPath: `data/patches/${patchId}/patch.json`
            });
            
            console.log('\n🎉 SUCCESS: Proceso finalizado (Creado marcador de mes sin parches)');
            process.exit(0);
        }

        log(`Error fatal: ${error.message}`, 'error');
        if (process.env.DEBUG) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

main();
