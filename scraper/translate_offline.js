const fs = require('fs-extra');
const path = require('path');
const { initTranslator } = require('./translator');

const PATCH_DIR = path.join(__dirname, '..', 'data', 'patches', '2026-06');
const PATCH_FILE = path.join(PATCH_DIR, 'patch.json');

async function main() {
    if (!await fs.pathExists(PATCH_FILE)) {
        console.error("❌ No existe el archivo patch.json en el directorio del último parche.");
        return;
    }

    console.log("📖 Cargando patch.json en inglés...");
    const patchData = await fs.readJson(PATCH_FILE);

    console.log("🤖 Inicializando modelo de traducción local...");
    await initTranslator();

    // 1. Recolectar todos los textos únicos (deduplicar para ahorrar tiempo de cómputo)
    const uniqueStrings = new Set();

    function collectFromHero(hero) {
        if (hero.desc) uniqueStrings.add(hero.desc);
        if (hero.changes) {
            hero.changes.forEach(change => {
                if (change.title) uniqueStrings.add(change.title);
                if (change.details) {
                    change.details.forEach(detail => uniqueStrings.add(detail));
                }
            });
        }
    }

    function collectFromSection(section) {
        if (!section) return;
        if (section.intro) uniqueStrings.add(section.intro);
        if (section.roles) {
            Object.values(section.roles).forEach(heroes => {
                heroes.forEach(collectFromHero);
            });
        }
        if (section.generalItems) {
            section.generalItems.forEach(collectFromHero);
        }
    }

    collectFromSection(patchData.sections.stadium);
    collectFromSection(patchData.sections.gameBase);

    const stringsList = Array.from(uniqueStrings).filter(s => s && s.trim() !== '');
    console.log(`🔍 Encontrados ${stringsList.length} textos únicos para traducir.`);

    // 2. Cargar pipeline de traducción
    const { pipeline } = await import('@xenova/transformers');
    const localTranslator = await pipeline('translation', 'Xenova/opus-mt-en-es');

    // 3. Traducir en lotes de 30 strings
    const translations = new Map();
    const batchSize = 30;

    console.log("🌐 Traduciendo textos offline...");
    const t0 = Date.now();
    for (let i = 0; i < stringsList.length; i += batchSize) {
        const batch = stringsList.slice(i, i + batchSize);
        console.log(`   [Lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(stringsList.length / batchSize)}] Traduciendo ${batch.length} textos...`);
        try {
            const results = await localTranslator(batch);
            batch.forEach((text, index) => {
                translations.set(text, results[index]?.translation_text || text);
            });
        } catch (err) {
            console.error(`   ❌ Error en lote, traduciendo individualmente...`, err.message);
            for (const text of batch) {
                try {
                    const res = await localTranslator(text);
                    translations.set(text, res[0]?.translation_text || text);
                } catch (e) {
                    translations.set(text, text);
                }
            }
        }
    }
    const t1 = Date.now();
    console.log(`⚡ Traducción completada en ${((t1 - t0) / 1000).toFixed(1)} segundos.`);

    // 4. Reemplazar textos en el JSON original
    function translateHero(hero) {
        if (hero.desc && translations.has(hero.desc)) {
            hero.desc = translations.get(hero.desc);
        }
        if (hero.changes) {
            hero.changes.forEach(change => {
                if (change.title && translations.has(change.title)) {
                    change.title = translations.get(change.title);
                }
                if (change.details) {
                    change.details = change.details.map(detail => translations.get(detail) || detail);
                }
            });
        }
    }

    function translateSectionObj(section) {
        if (!section) return;
        if (section.intro && translations.has(section.intro)) {
            section.intro = translations.get(section.intro);
        }
        if (section.roles) {
            Object.values(section.roles).forEach(heroes => {
                heroes.forEach(translateHero);
            });
        }
        if (section.generalItems) {
            section.generalItems.forEach(translateHero);
        }
    }

    translateSectionObj(patchData.sections.stadium);
    translateSectionObj(patchData.sections.gameBase);

    // 5. Escribir patch.json de vuelta
    console.log("💾 Guardando patch.json traducido...");
    await fs.writeJson(PATCH_FILE, patchData, { spaces: 2 });
    console.log("🎉 ¡Proceso finalizado con éxito!");
}

main();
