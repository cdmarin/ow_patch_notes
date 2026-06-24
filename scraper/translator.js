/**
 * translator.js — Módulo de traducción automática via Google Translate
 */

const axios = require('axios');

// Configuración de traducción online (Google Translate)
let useGoogleTranslate = true; // Por defecto usar Google Translate

/**
 * Inicializa el traductor.
 */
async function initTranslator() {
    if (useGoogleTranslate) {
        console.log('🌐 Usando la API de Google Translate (Rápida, 0% CPU local)...');
    } else {
        console.log('ℹ️  Traducción automática desactivada.');
    }
}

/**
 * Traduce un texto de inglés a español usando Google Translate.
 * Si falla, retorna el texto original en inglés.
 * @param {string} text - Texto a traducir
 * @returns {Promise<string>} - Texto traducido o el original
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
    
    return text; // Fallback al inglés original
}

/**
 * Traduce un array de strings en batch.
 * @param {string[]} texts - Array de textos a traducir
 * @returns {Promise<string[]>} - Array de textos traducidos o los originales
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

    return texts;
}

/**
 * Traduce un objeto de cambios de héroe completo.
 * @param {Object} heroData - Datos del héroe con cambios
 * @returns {Promise<Object>} - Datos del héroe traducidos o los originales
 */
async function translateHero(heroData) {
    console.log(`  🌐 Traduciendo: ${heroData.name}...`);
    
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
async function translateSection(section) {
    const translated = { ...section };
    
    if (section.intro) {
        translated.intro = await translateText(section.intro);
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
