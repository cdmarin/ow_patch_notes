/**
 * translator.js — Módulo de traducción automática via LibreTranslate
 * 
 * LibreTranslate es open source y self-hosteable.
 * También hay instancias públicas gratuitas disponibles.
 * 
 * Instancia pública por defecto: https://libretranslate.com
 * Para self-host: https://github.com/LibreTranslate/LibreTranslate
 */

const axios = require('axios');

// Configuración de LibreTranslate
const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com';
const LIBRETRANSLATE_KEY = process.env.LIBRETRANSLATE_KEY || ''; // Vacío = sin autenticación

// Configuración de traducción local (Transformers.js) y online (Google Translate)
let localTranslator = null;
let useLocalAI = false;
let useGoogleTranslate = true; // Por defecto usar Google Translate

// Rate limiting: espera entre requests para no saturar la API externa (solo para LibreTranslate)
const DELAY_MS = 500;
const sleep = (ms) => {
    if (useLocalAI || useGoogleTranslate) return Promise.resolve(); // Sin espera para traducción rápida
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Inicializa el traductor. Si está en modo Google Translate, no requiere modelo local.
 */
async function initTranslator() {
    if (useGoogleTranslate) {
        console.log('🌐 Usando la API de Google Translate (Rápida, 0% CPU local)...');
        return;
    }
    
    try {
        // Intentar import dinámico (CommonJS compatible con ESM de transformers.js)
        const { pipeline } = await import('@xenova/transformers');
        console.log('🤖 Inicializando modelo de traducción local (Helsinki-NLP/opus-mt-en-es)...');
        console.log('ℹ️  La primera vez se descargará el modelo (~120MB), espera un momento...');
        localTranslator = await pipeline('translation', 'Xenova/opus-mt-en-es');
        useLocalAI = true;
        console.log('🤖 ¡Modelo local cargado exitosamente! Traducción 100% offline activada.');
    } catch (e) {
        console.warn('⚠️  No se pudo inicializar Transformers.js. Detalle del error:', e.message);
        console.log('ℹ️  Usando LibreTranslate como fallback.');
    }
}

/**
 * Traduce un texto de inglés a español.
 * @param {string} text - Texto a traducir
 * @returns {Promise<string>} - Texto traducido
 */
async function translateText(text) {
    if (!text || text.trim() === '') return text;
    
    if (useGoogleTranslate) {
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;
            const response = await axios.get(url, { timeout: 10000 });
            if (response.data && response.data[0]) {
                return response.data[0].map(item => item[0]).join('');
            }
        } catch (error) {
            console.warn(`⚠️  Error con Google Translate: "${text.substring(0, 50)}..."`, error.message);
        }
    }
    
    // Si falla o no se usa Google Translate: Fallback a Local AI
    if (useLocalAI && localTranslator) {
        try {
            const result = await localTranslator(text);
            return result[0]?.translation_text || text;
        } catch (error) {
            console.warn(`⚠️  Error con traducción local: "${text.substring(0, 50)}..."`, error.message);
            return text;
        }
    }
    
    // Fallback: LibreTranslate
    try {
        const payload = {
            q: text,
            source: 'en',
            target: 'es',
            format: 'text'
        };
        
        if (LIBRETRANSLATE_KEY) {
            payload.api_key = LIBRETRANSLATE_KEY;
        }
        
        const response = await axios.post(`${LIBRETRANSLATE_URL}/translate`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        return response.data.translatedText;
    } catch (error) {
        console.warn(`⚠️  Error traduciendo (LibreTranslate): "${text.substring(0, 50)}..."`, error.message);
        return text; // Devuelve el original si falla
    }
}

/**
 * Traduce un array de strings en batch.
 * @param {string[]} texts - Array de textos a traducir
 * @returns {Promise<string[]>} - Array de textos traducidos
 */
async function translateBatch(texts) {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    if (useGoogleTranslate) {
        try {
            const results = [];
            for (const text of texts) {
                const translated = await translateText(text);
                results.push(translated);
                await new Promise(resolve => setTimeout(resolve, 80)); // Pequeña espera para evitar rate limiting (429)
            }
            return results;
        } catch (error) {
            console.warn(`⚠️  Error en traducción batch con Google Translate:`, error.message);
            return texts; // Retornar originales en caso de error
        }
    }

    if (useLocalAI && localTranslator) {
        try {
            const results = await localTranslator(texts);
            return results.map(r => r?.translation_text || '');
        } catch (error) {
            console.warn(`⚠️  Error con traducción local batch:`, error.message);
        }
    }

    const results = [];
    for (const text of texts) {
        const translated = await translateText(text);
        results.push(translated);
        await sleep(DELAY_MS);
    }
    return results;
}

/**
 * Traduce un objeto de cambios de héroe completo.
 * @param {Object} heroData - Datos del héroe con cambios
 * @returns {Promise<Object>} - Datos del héroe traducidos
 */
async function translateHero(heroData) {
    console.log(`  🌐 Traduciendo: ${heroData.name}...`);
    
    // Si no se usa traducción rápida (Google o Local AI), comportamiento secuencial original con delay
    if (!useGoogleTranslate && (!useLocalAI || !localTranslator)) {
        const translated = { ...heroData };
        
        // Traducir descripción
        if (heroData.desc) {
            translated.desc = await translateText(heroData.desc);
            await sleep(DELAY_MS);
        }
        
        // Traducir cambios
        if (heroData.changes) {
            translated.changes = [];
            for (const change of heroData.changes) {
                const translatedChange = {
                    ...change,
                    title: await translateText(change.title),
                };
                await sleep(DELAY_MS);
                
                translatedChange.details = await translateBatch(change.details);
                translated.changes.push(translatedChange);
            }
        }
        
        return translated;
    }

    // Con Google Translate o IA local: Agrupar todo el texto en un único batch/paralelo
    try {
        const stringsToTranslate = [];
        const mapping = []; // Permite mapear los resultados de vuelta a su propiedad original
        
        if (heroData.desc) {
            stringsToTranslate.push(heroData.desc);
            mapping.push({ type: 'desc' });
        }
        
        if (heroData.changes) {
            heroData.changes.forEach((change, changeIdx) => {
                stringsToTranslate.push(change.title);
                mapping.push({ type: 'change_title', changeIdx });
                
                if (change.details) {
                    change.details.forEach((detail, detailIdx) => {
                        stringsToTranslate.push(detail);
                        mapping.push({ type: 'change_detail', changeIdx, detailIdx });
                    });
                }
            });
        }
        
        if (stringsToTranslate.length === 0) {
            return heroData;
        }
        
        // Traducir todo de una sola vez
        let translatedStrings;
        if (useLocalAI && localTranslator) {
            const results = await localTranslator(stringsToTranslate);
            translatedStrings = results.map(r => r?.translation_text || '');
        } else {
            translatedStrings = await translateBatch(stringsToTranslate);
        }
        
        // Reconstruir el objeto traducido clonando en profundidad
        const translated = { ...heroData };
        if (heroData.changes) {
            translated.changes = heroData.changes.map(c => ({
                ...c,
                details: c.details ? [...c.details] : []
            }));
        }
        
        mapping.forEach((mapInfo, index) => {
            const translatedText = translatedStrings[index];
            if (mapInfo.type === 'desc') {
                translated.desc = translatedText;
            } else if (mapInfo.type === 'change_title') {
                translated.changes[mapInfo.changeIdx].title = translatedText;
            } else if (mapInfo.type === 'change_detail') {
                translated.changes[mapInfo.changeIdx].details[mapInfo.detailIdx] = translatedText;
            }
        });
        
        return translated;
    } catch (error) {
        console.warn(`⚠️  Error con traducción local batch de héroe (${heroData.name}):`, error.message);
        return heroData; // Fallback al original sin traducir en caso de error fatal
    }
}

/**
 * Traduce una sección completa del parche.
 * @param {Object} section - Sección del parche
 * @returns {Promise<Object>} - Sección traducida
 */
async function translateSection(section) {
    const translated = { ...section };
    
    if (section.intro) {
        translated.intro = await translateText(section.intro);
        await sleep(DELAY_MS);
    }
    
    if (section.roles) {
        translated.roles = {};
        for (const [role, heroes] of Object.entries(section.roles)) {
            console.log(`\n📁 Traduciendo rol: ${role}`);
            translated.roles[role] = [];
            for (const hero of heroes) {
                translated.roles[role].push(await translateHero(hero));
            }
        }
    }
    
    if (section.generalItems) {
        console.log(`\n📦 Traduciendo objetos generales...`);
        translated.generalItems = [];
        for (const item of section.generalItems) {
            translated.generalItems.push(await translateHero(item));
        }
    }
    
    return translated;
}

module.exports = { translateText, translateBatch, translateHero, translateSection, initTranslator };
