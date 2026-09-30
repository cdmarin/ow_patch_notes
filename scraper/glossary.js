/**
 * glossary.js — Glosario de nombres oficiales (inglés → español)
 *
 * La traducción oficial de Blizzard suele publicarse días después que la inglesa, así que
 * los parches nuevos se traducen casi siempre de forma automática. El problema de la
 * traducción automática son los nombres propios (habilidades, ventajas, poderes, objetos):
 * Google los traduce literalmente ("Tow Beans" → "Frijoles de remolque") y de forma
 * incoherente entre el título y el texto.
 *
 * Este glosario aprende solo: cada vez que hay una versión oficial en español de un parche,
 * se emparejan los títulos ingleses con los españoles y se guardan. Después, la traducción
 * automática usa el nombre oficial si lo conoce y, si no, deja el nombre en inglés.
 *
 * Formato de data/glossary.json:
 *   { "terms":    { "Call Mech": "Llamar al meca", ... },   ← nombres propios
 *     "suffixes": { "Minor Perk": "Ventaja menor", ... } }  ← sufijos de títulos "Nombre – Sufijo"
 */

const fs = require('fs-extra');
const path = require('path');

const GLOSSARY_PATH = path.join(__dirname, '..', 'data', 'glossary.json');
const TITLE_SEPARATOR = /\s+[–—-]\s+/;

let glossary = { terms: {}, suffixes: {} };
let dirty = false;

async function loadGlossary() {
    try {
        if (await fs.pathExists(GLOSSARY_PATH)) {
            const data = await fs.readJson(GLOSSARY_PATH);
            glossary = { terms: data.terms || {}, suffixes: data.suffixes || {} };
        }
    } catch (err) {
        console.warn(`⚠️  No se pudo leer el glosario: ${err.message}`);
    }
    return glossary;
}

async function saveGlossary() {
    if (!dirty) return false;
    const sortKeys = (obj) => Object.fromEntries(Object.keys(obj).sort((a, b) => a.localeCompare(b)).map(k => [k, obj[k]]));
    await fs.writeJson(GLOSSARY_PATH, { terms: sortKeys(glossary.terms), suffixes: sortKeys(glossary.suffixes) }, { spaces: 2 });
    dirty = false;
    return true;
}

function setEntry(table, en, es) {
    en = (en || '').trim();
    es = (es || '').trim();
    if (!en || !es || en.length > 60 || es.length > 80) return;
    if (glossary[table][en] !== es) {
        glossary[table][en] = es;
        dirty = true;
    }
}

/**
 * Divide "Nombre – Sufijo" en sus partes. Devuelve null si no tiene exactamente dos.
 */
function splitTitle(title) {
    const parts = (title || '').split(TITLE_SEPARATOR);
    return parts.length === 2 && parts[0] && parts[1] ? parts : null;
}

/**
 * ¿El título de un cambio es un nombre propio (habilidad, ventaja, poder...) y no una frase?
 */
function isNameTitle(change) {
    return !!change.icon || !!splitTitle(change.title);
}

/**
 * Aprende nombres a partir de un parche inglés y su versión oficial española
 * (ya validados con la misma estructura).
 */
function learnFromPatches(en, es) {
    for (const key of ['stadium', 'arcade', 'gameBase']) {
        const a = en.sections[key];
        const b = es.sections[key];
        if (!a || !b) continue;
        const pairs = [];
        for (const role of Object.keys(a.roles || {})) {
            (a.roles[role] || []).forEach((hero, i) => pairs.push([hero, b.roles[role][i], false]));
        }
        (a.generalItems || []).forEach((item, i) => pairs.push([item, b.generalItems[i], true]));

        for (const [heroEn, heroEs, isItem] of pairs) {
            if (isItem && heroEn.name && heroEs.name) setEntry('terms', heroEn.name, heroEs.name);
            (heroEn.changes || []).forEach((change, i) => {
                const changeEs = heroEs.changes[i];
                if (!changeEs || !isNameTitle(change)) return;
                const partsEn = splitTitle(change.title);
                const partsEs = splitTitle(changeEs.title);
                if (partsEn && partsEs) {
                    setEntry('terms', partsEn[0], partsEs[0]);
                    setEntry('suffixes', partsEn[1], partsEs[1]);
                } else if (!partsEn && !partsEs) {
                    setEntry('terms', change.title, changeEs.title);
                }
            });
        }
    }
}

/**
 * Traduce un título que es un nombre propio usando el glosario.
 * Devuelve { text, pending } donde pending es el sufijo que aún hay que traducir
 * automáticamente (o null).
 */
function translateNameTitle(title) {
    if (glossary.terms[title]) return { text: glossary.terms[title], pending: null };
    const parts = splitTitle(title);
    if (!parts) return { text: title, pending: null }; // Nombre desconocido: se deja en inglés
    const [name, suffix] = parts;
    const sep = title.match(TITLE_SEPARATOR)[0];
    const nameEs = glossary.terms[name] || name;
    if (glossary.suffixes[suffix]) return { text: `${nameEs}${sep}${glossary.suffixes[suffix]}`, pending: null };
    return { text: nameEs, sep, pending: suffix };
}

function getTerms() {
    return glossary.terms;
}

module.exports = {
    loadGlossary,
    saveGlossary,
    learnFromPatches,
    translateNameTitle,
    isNameTitle,
    splitTitle,
    getTerms,
    GLOSSARY_PATH
};
