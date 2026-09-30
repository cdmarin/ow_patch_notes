/**
 * translator.js — Módulo de traducción automática via Google Translate
 */

const axios = require('axios');
const glossary = require('./glossary');

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

// Número de textos que no se pudieron traducir (se devolvió el original en inglés).
// El scraper lo usa para no marcar un parche como traducido si algo falló.
let translationFailures = 0;

function resetTranslationFailures() {
    translationFailures = 0;
}

function getTranslationFailures() {
    return translationFailures;
}

// ─── Términos protegidos ─────────────────────────────────────────────────────
// Nombres propios (habilidades, ventajas, poderes, objetos, héroes) que no deben traducirse
// literalmente. Mapa inglés → texto a usar (nombre oficial del glosario o el propio inglés).
let protectedTerms = new Map();
const MIN_TERM_LENGTH = 4;

/**
 * Prepara los términos protegidos para un parche: los del glosario más los nombres de
 * héroes y habilidades que aparecen en el propio parche (estos, si no están en el glosario,
 * se dejan en inglés en lugar de traducirse literalmente).
 */
function setPatchContext(patchData) {
    const terms = glossary.getTerms();
    const map = new Map();
    const addSelf = (name) => {
        name = (name || '').trim();
        if (name.length >= MIN_TERM_LENGTH && !map.has(name)) map.set(name, terms[name] || name);
    };
    for (const [en, es] of Object.entries(terms)) {
        if (en.length >= MIN_TERM_LENGTH) map.set(en, es);
    }
    const sections = (patchData && patchData.sections) || {};
    for (const key of ['stadium', 'arcade', 'gameBase']) {
        const section = sections[key];
        if (!section) continue;
        const entries = [...Object.values(section.roles || {}).flat(), ...(section.generalItems || [])];
        for (const hero of entries) {
            addSelf(hero.name);
            for (const change of hero.changes || []) {
                if (!glossary.isNameTitle(change)) continue;
                const parts = glossary.splitTitle(change.title);
                addSelf(parts ? parts[0] : change.title);
            }
        }
    }
    protectedTerms = map;
}

function clearPatchContext() {
    protectedTerms = new Map();
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function termRegExp(term) {
    return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(term)}(?![\\p{L}\\p{N}])`, 'gu');
}

/**
 * Sustituye los términos protegidos por marcadores [[n]] que el traductor no toca.
 */
function maskTerms(text) {
    const tokens = [];
    if (protectedTerms.size === 0) return { masked: text, tokens };
    let masked = text;
    const candidates = [...protectedTerms.keys()]
        .filter(term => text.includes(term))
        .sort((a, b) => b.length - a.length);
    for (const term of candidates) {
        const re = termRegExp(term);
        if (!re.test(masked)) continue;
        const idx = tokens.length;
        tokens.push({ en: term, es: protectedTerms.get(term) });
        masked = masked.replace(termRegExp(term), `[[${idx}]]`);
    }
    return { masked, tokens };
}

/**
 * Restaura los marcadores. Devuelve null si el traductor ha perdido o alterado alguno.
 */
function unmaskTerms(translated, tokens) {
    const seen = new Set();
    const restored = translated.replace(/\[\s*\[\s*(\d+)\s*\]\s*\]/g, (match, n) => {
        const token = tokens[Number(n)];
        if (!token) return match;
        seen.add(Number(n));
        return token.es;
    });
    if (seen.size !== tokens.length || /\[\s*\[|\]\s*\]/.test(restored)) return null;
    return restored;
}

/**
 * Tras una traducción sin marcadores: sustituye los nombres que el traductor dejó en inglés
 * por su nombre oficial.
 */
function replaceKnownTerms(translated, tokens) {
    let out = translated;
    for (const { en, es } of tokens) {
        if (en !== es) out = out.replace(termRegExp(en), es);
    }
    return out;
}

// Función que llama a los servicios de traducción (sustituible en tests)
let rawTranslator = null;
function _setRawTranslator(fn) {
    rawTranslator = fn;
}

const MYMEMORY_MAX_CHARS = 450; // MyMemory rechaza consultas de más de 500 bytes

/**
 * Limpia la salida del traductor automático:
 * - Elimina caracteres invisibles (U+200B...) que Google inserta, sobre todo junto a números.
 * - Colapsa espacios repetidos.
 * - Conserva la mayúscula inicial del original (Google devuelve "apuntar" para "Take Aim").
 */
function normalizeTranslation(original, translated) {
    if (typeof translated !== 'string') return translated;
    let out = translated
        .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
        .replace(/[ \t\u00A0]{2,}/g, ' ')
        .trim();

    const firstOriginal = (original || '').trim().charAt(0);
    if (firstOriginal && firstOriginal === firstOriginal.toUpperCase() && firstOriginal !== firstOriginal.toLowerCase()) {
        out = out.charAt(0).toUpperCase() + out.slice(1);
    }
    return out;
}

/**
 * Divide un texto en trozos de como máximo maxLen caracteres, cortando por frases.
 */
function splitIntoChunks(text, maxLen) {
    if (text.length <= maxLen) return [text];
    const sentences = text.match(/[^.!?\n]+[.!?]*\s*|\n+/g) || [text];
    const chunks = [];
    let current = '';
    for (const sentence of sentences) {
        if ((current + sentence).length > maxLen && current) {
            chunks.push(current);
            current = '';
        }
        if (sentence.length > maxLen) {
            // Frase demasiado larga: cortar por palabras
            for (const word of sentence.split(/(\s+)/)) {
                if ((current + word).length > maxLen && current) {
                    chunks.push(current);
                    current = '';
                }
                current += word;
            }
        } else {
            current += sentence;
        }
    }
    if (current) chunks.push(current);
    return chunks;
}

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
 * Devuelve null si falla.
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
    return null;
}

/**
 * Traduce un texto de inglés a español usando la API de MyMemory.
 * Devuelve null si falla (incluye cuota agotada o texto demasiado largo, que MyMemory
 * devuelve como si fueran la traducción: "MYMEMORY WARNING...", "QUERY LENGTH LIMIT...").
 */
async function translateTextWithMyMemory(text) {
    if (!text || text.trim() === '') return text;
    const email = process.env.MYMEMORY_EMAIL || 'carlosalcuadrado2@gmail.com';
    const parts = [];
    for (const chunk of splitIntoChunks(text, MYMEMORY_MAX_CHARS)) {
        if (chunk.trim() === '') {
            parts.push(chunk);
            continue;
        }
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk.trim())}&langpair=en|es&de=${encodeURIComponent(email)}`;
            const response = await axios.get(url, { timeout: 10000 });
            const data = response.data || {};
            const translated = data.responseData && data.responseData.translatedText;
            const status = Number(data.responseStatus);
            if (!translated || (status && status !== 200) || /MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID LANGUAGE PAIR/i.test(translated)) {
                console.warn(`⚠️  MyMemory no devolvió una traducción válida (status ${data.responseStatus}): "${chunk.substring(0, 50)}..."`);
                return null;
            }
            const leading = chunk.match(/^\s*/)[0];
            const trailing = chunk.match(/\s*$/)[0];
            parts.push(leading + translated + trailing);
        } catch (error) {
            console.warn(`⚠️  Error con MyMemory Translate: "${chunk.substring(0, 50)}..."`, error.message);
            return null;
        }
    }
    return parts.join('');
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

    const translate = rawTranslator || translateTextRaw;
    const { masked, tokens } = maskTerms(text);

    if (tokens.length > 0) {
        // Todo el texto es un nombre protegido: no hace falta traducir
        if (/^(\s*\[\[\d+\]\]\s*)+$/.test(masked)) return unmaskTerms(masked, tokens);

        const translatedMasked = await translate(masked);
        if (translatedMasked !== null && translatedMasked !== undefined) {
            const restored = unmaskTerms(translatedMasked, tokens);
            if (restored !== null) return normalizeTranslation(text, restored);
        }
        // El traductor estropeó los marcadores: traducir sin ellos y corregir después
    }

    const translated = await translate(text);
    if (translated === null || translated === undefined) {
        translationFailures++;
        return text;
    }
    return normalizeTranslation(text, replaceKnownTerms(translated, tokens));
}

/**
 * Traduce el título de un cambio. Si es un nombre propio (habilidad con icono, o
 * "Nombre – Ventaja menor", "Nombre - Power"...), usa el nombre oficial del glosario o lo deja
 * en inglés, y solo traduce automáticamente el sufijo si no se conoce.
 */
async function translateChangeTitle(change) {
    if (!glossary.isNameTitle(change)) return translateText(change.title);
    const result = glossary.translateNameTitle(change.title);
    if (!result.pending) return result.text;
    const suffix = await translateText(result.pending);
    return `${result.text}${result.sep}${suffix}`;
}

/**
 * Pide la traducción a los servicios disponibles. Devuelve null si ninguno funcionó.
 */
async function translateTextRaw(text) {

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
            if (response.data && Array.isArray(response.data[0])) {
                const joined = response.data[0].map(item => item[0]).filter(Boolean).join('');
                if (joined.trim()) return joined;
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
            translationFailures += texts.length;
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
        const nameTitles = new Map(); // changeIdx → título ya resuelto con el glosario

        if (heroData.desc) {
            stringsToTranslate.push(heroData.desc);
            mapping.push({ type: 'desc' });
        }

        if (heroData.changes) {
            for (const [changeIdx, change] of heroData.changes.entries()) {
                if (glossary.isNameTitle(change)) {
                    // Los nombres propios se resuelven con el glosario, no con el traductor
                    nameTitles.set(changeIdx, await translateChangeTitle(change));
                } else {
                    stringsToTranslate.push(change.title);
                    mapping.push({ type: 'change_title', changeIdx });
                }

                if (change.details) {
                    change.details.forEach((detail, detailIdx) => {
                        stringsToTranslate.push(detail);
                        mapping.push({ type: 'change_detail', changeIdx, detailIdx });
                    });
                }
            }
        }

        // Traducir todo de una sola vez
        const translatedStrings = stringsToTranslate.length > 0 ? await translateBatch(stringsToTranslate) : [];

        // Reconstruir el objeto traducido clonando en profundidad
        const translated = { ...heroData };
        if (heroData.changes) {
            translated.changes = heroData.changes.map(c => ({
                ...c,
                details: c.details ? [...c.details] : []
            }));
            for (const [changeIdx, title] of nameTitles) {
                translated.changes[changeIdx].title = title;
            }
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
        translationFailures++;
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

module.exports = {
    translateText,
    translateBatch,
    translateHero,
    translateSection,
    initTranslator,
    normalizeTranslation,
    setPatchContext,
    clearPatchContext,
    _setRawTranslator,
    resetTranslationFailures,
    getTranslationFailures
};
