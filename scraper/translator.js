/**
 * translator.js — Módulo de traducción automática via Google Translate
 */

const axios = require('axios');

function getFormattedTimestamp() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}:${ms}`;
}

// Configuración de traducción online (Google Translate)
let useGoogleTranslate = true; // Por defecto usar Google Translate
let googleTranslateBlocked = false; // Indica si Google Translate ha sido bloqueado temporalmente (429)

/**
 * Inicializa el traductor.
 */
async function initTranslator() {
    if (useGoogleTranslate) {
        if (process.env.LIBRETRANSLATE_URL) {
            console.log(`🌐 Iniciando el traductor (LibreTranslate en ${process.env.LIBRETRANSLATE_URL})...`);
        } else {
            console.log('🌐 Iniciando el traductor (Google Translate con fallback a MyMemory)...');
        }
    } else {
        console.log('ℹ️  Traducción automática desactivada.');
    }
}

/**
 * Traduce un texto de inglés a español usando la API de LibreTranslate.
 */
async function translateTextWithLibreTranslate(text) {
    if (!text || text.trim() === '') return text;
    const url = process.env.LIBRETRANSLATE_URL;
    const apiKey = process.env.LIBRETRANSLATE_KEY;
    try {
        const response = await axios.post(`${url}/translate`, {
            q: text,
            source: 'en',
            target: 'es',
            format: 'text',
            api_key: apiKey
        }, { timeout: 15000 });
        if (response.data && response.data.translatedText) {
            return response.data.translatedText;
        }
    } catch (error) {
        console.warn(`⚠️  Error con LibreTranslate: "${text.substring(0, 50)}..."`, error.message);
    }
    return text;
}

/**
 * Traduce un texto de inglés a español usando la API de MyMemory.
 */
async function translateTextWithMyMemory(text) {
    if (!text || text.trim() === '') return text;
    try {
        const email = process.env.MYMEMORY_EMAIL || 'carlosalcuadrado2@gmail.com';
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es&de=${encodeURIComponent(email)}`;
        const response = await axios.get(url, { timeout: 10000 });
        if (response.data && response.data.responseData && response.data.responseData.translatedText) {
            return response.data.responseData.translatedText;
        }
    } catch (error) {
        console.warn(`⚠️  Error con MyMemory Translate: "${text.substring(0, 50)}..."`, error.message);
    }
    return text;
}

const TRANSLATION_OVERRIDES = {
    'removed.': 'Eliminado.',
    'removed': 'Eliminado',
    'added.': 'Añadido.',
    'added': 'Añadido',
    'reworked.': 'Reelaborado.',
    'reworked': 'Reelaborado',
    'new.': 'Nuevo.',
    'new': 'Nuevo'
};

/**
 * Traduce un texto de inglés a español usando Google Translate.
 * Si falla, hace fallback a MyMemory (o LibreTranslate si está configurado).
 * @param {string} text - Texto a traducir
 * @returns {Promise<string>} - Texto traducido o el original
 */
async function translateText(text) {
    if (!text || text.trim() === '') return text;

    const trimmedLower = text.toLowerCase().trim();
    if (TRANSLATION_OVERRIDES[trimmedLower]) {
        return TRANSLATION_OVERRIDES[trimmedLower];
    }

    if (!useGoogleTranslate) return text;

    // 1. Si está configurado LibreTranslate, usarlo como primera opción
    if (process.env.LIBRETRANSLATE_URL) {
        return await translateTextWithLibreTranslate(text);
    }

    // 2. Intentar Google Translate si no está bloqueado
    if (!googleTranslateBlocked) {
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;
            const response = await axios.get(url, { timeout: 10000 });
            if (response.data && response.data[0]) {
                return response.data[0].map(item => item[0]).join('');
            }
        } catch (error) {
            const is429 = error.response && (error.response.status === 429 || error.response.status === 403);
            if (is429) {
                console.warn(`⚠️  Google Translate bloqueado (Status ${error.response.status}). Activando fallback a MyMemory API...`);
                googleTranslateBlocked = true;
            } else {
                console.warn(`⚠️  Error con Google Translate: "${text.substring(0, 50)}..."`, error.message);
            }
            return await translateTextWithMyMemory(text);
        }
    }

    // 3. Fallback a MyMemory
    return await translateTextWithMyMemory(text);
}

/**
 * Traduce un array de strings en batch.
 * @param {string[]} texts - Array de textos a traducir
 * @returns {Promise<string[]>} - Array de textos traducidos o los originales
 */
async function translateBatch(texts, onProgress) {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    if (useGoogleTranslate) {
        try {
            const results = [];
            for (const text of texts) {
                const translated = await translateText(text);
                results.push(translated);
                if (onProgress) onProgress();
                await new Promise(resolve => setTimeout(resolve, 80)); // Pequeña espera para evitar rate limiting (429)
            }
            return results;
        } catch (error) {
            console.warn(`⚠️  Error en traducción batch con Google Translate:`, error.message);
            return texts; // Retornar originales en caso de error
        }
    }

    return texts;
}

/**
 * Traduce un objeto de cambios de héroe completo.
 * @param {Object} heroData - Datos del héroe con cambios
 * @returns {Promise<Object>} - Datos del héroe traducidos o los originales
 */
async function translateHero(heroData) {
    console.log(`  🌐 Traduciendo: ${heroData.name}... ${getFormattedTimestamp()}`);

    // Si no se usa traducción, retornar original
    if (!useGoogleTranslate) {
        return heroData;
    }

    // Con Google Translate: Agrupar todo el texto en un único batch
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
        const translatedStrings = await translateBatch(stringsToTranslate);

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
        console.warn(`⚠️  Error con traducción batch de héroe (${heroData.name}):`, error.message);
        return heroData; // Fallback al original sin traducir en caso de error fatal
    }
}

/**
 * Traduce una sección completa del parche.
 * @param {Object} section - Sección del parche
 * @returns {Promise<Object>} - Sección traducida
 */
async function translateSection(section, onProgress) {
    const translated = { ...section };

    if (section.intro) {
        translated.intro = await translateText(section.intro);
        if (onProgress) onProgress();
    }

    if (section.roles) {
        translated.roles = {};
        for (const [role, heroes] of Object.entries(section.roles)) {
            if (heroes && heroes.length > 0) {
                console.log(`\n📁 Traduciendo rol: ${role} ... ${getFormattedTimestamp()}`);
            }
            translated.roles[role] = [];
            for (const hero of heroes) {
                translated.roles[role].push(await translateHero(hero));
                if (onProgress) onProgress();
            }
        }
    }

    if (section.generalItems) {
        translated.generalItems = [];
        if (section.generalItems.length > 0) {
            console.log(`\n📦 Traduciendo objetos generales... ${getFormattedTimestamp()}`);
        }
        for (const item of section.generalItems) {
            translated.generalItems.push(await translateHero(item));
            if (onProgress) onProgress();
        }
    }

    return translated;
}

module.exports = { translateText, translateBatch, translateHero, translateSection, initTranslator };
