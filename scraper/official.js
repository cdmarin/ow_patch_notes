/**
 * official.js — Traducción oficial de Blizzard
 *
 * Blizzard publica las notas de parche también en español
 * (https://overwatch.blizzard.com/es-es/news/patch-notes/). Ese texto es mucho mejor que
 * cualquier traducción automática: usa los nombres oficiales de habilidades, poderes y
 * objetos, y los comentarios de los desarrolladores están traducidos por personas.
 *
 * Estrategia:
 *   1. Se parsea la página inglesa (como siempre) registrando, para cada sección, el
 *      contexto deducido (stadium, arcade, bugFixes...) y, para cada héroe, su rol.
 *   2. Se parsea la página española reutilizando esos contextos/roles, de modo que ambos
 *      resultados tengan la misma forma.
 *   3. Solo si la forma coincide exactamente (mismo número de héroes, cambios, detalles,
 *      correcciones de errores...) se copian los textos en español sobre los datos ingleses.
 *      Si no coincide (Blizzard aún no ha publicado la versión española, cambia la
 *      estructura...), ese parche se traduce de forma automática como antes.
 */

const { parseHTML } = require('./parser');

const HERO_SECTIONS = ['stadium', 'arcade', 'gameBase'];

/**
 * Deduce la URL española a partir de la inglesa (en-us → es-es).
 * Se puede cambiar el idioma con la variable de entorno OFFICIAL_LOCALE (p. ej. es-mx).
 */
function getOfficialSpanishUrl(englishUrl) {
    const locale = process.env.OFFICIAL_LOCALE || 'es-es';
    if (/\/en-us\//i.test(englishUrl)) {
        return englishUrl.replace(/\/en-us\//i, `/${locale}/`);
    }
    return null;
}

/**
 * Comprueba que dos parches parseados tienen exactamente la misma estructura.
 * Devuelve null si coinciden o un texto con el motivo de la diferencia.
 */
function findShapeMismatch(en, es) {
    for (const key of HERO_SECTIONS) {
        const a = en.sections[key];
        const b = es.sections[key];
        if (!a && !b) continue;
        if (!a || !b) return `sección ${key} ausente`;
        if (!!a.intro !== !!b.intro) return `intro de ${key}`;

        for (const role of Object.keys(a.roles || {})) {
            const heroesA = a.roles[role] || [];
            const heroesB = (b.roles || {})[role] || [];
            if (heroesA.length !== heroesB.length) return `${key}/${role}: ${heroesA.length} vs ${heroesB.length} héroes`;
            for (let i = 0; i < heroesA.length; i++) {
                const mismatch = findHeroMismatch(heroesA[i], heroesB[i]);
                if (mismatch) return `${key}/${role}/${heroesA[i].name}: ${mismatch}`;
            }
        }

        const itemsA = a.generalItems || [];
        const itemsB = b.generalItems || [];
        if (itemsA.length !== itemsB.length) return `${key}: ${itemsA.length} vs ${itemsB.length} objetos generales`;
        for (let i = 0; i < itemsA.length; i++) {
            const mismatch = findHeroMismatch(itemsA[i], itemsB[i]);
            if (mismatch) return `${key}/general/${itemsA[i].name}: ${mismatch}`;
        }
    }

    const bugsA = en.sections.bugFixes || [];
    const bugsB = es.sections.bugFixes || [];
    if (bugsA.length !== bugsB.length) return `correcciones de errores: ${bugsA.length} vs ${bugsB.length}`;

    return null;
}

function findHeroMismatch(a, b) {
    if (!!a.desc !== !!b.desc) return 'comentario del desarrollador';
    const changesA = a.changes || [];
    const changesB = b.changes || [];
    if (changesA.length !== changesB.length) return `${changesA.length} vs ${changesB.length} cambios`;
    for (let i = 0; i < changesA.length; i++) {
        const detailsA = changesA[i].details || [];
        const detailsB = changesB[i].details || [];
        if (detailsA.length !== detailsB.length) return `cambio ${i + 1}: ${detailsA.length} vs ${detailsB.length} detalles`;
        if (!!changesA[i].icon !== !!changesB[i].icon) return `cambio ${i + 1}: icono`;
    }
    return null;
}

/**
 * Copia los textos españoles sobre el parche inglés (que ya tiene la forma validada).
 * Se conservan los nombres de héroe en inglés (el frontend y el mapa de roles dependen de
 * ellos), los retratos, los iconos y el tipo de cambio (buff/nerf), que se deduce del inglés.
 */
function applySpanishText(en, es, skipSections = []) {
    for (const key of HERO_SECTIONS) {
        if (skipSections.includes(key)) continue; // Sección preservada de una ejecución anterior
        const a = en.sections[key];
        const b = es.sections[key];
        if (!a || !b) continue;
        if (a.intro) a.intro = b.intro;

        for (const role of Object.keys(a.roles || {})) {
            (a.roles[role] || []).forEach((hero, i) => applyHeroText(hero, b.roles[role][i], false));
        }
        (a.generalItems || []).forEach((item, i) => applyHeroText(item, b.generalItems[i], true));
    }
    if (en.sections.bugFixes && !skipSections.includes('bugFixes')) {
        en.sections.bugFixes = [...es.sections.bugFixes];
    }
}

function applyHeroText(target, source, copyName) {
    if (copyName && source.name) target.name = source.name;
    if (target.desc) target.desc = source.desc;
    (target.changes || []).forEach((change, i) => {
        const sourceChange = source.changes[i];
        change.title = sourceChange.title;
        change.details = [...sourceChange.details];
    });
}

/**
 * Parsea la página española usando la estructura de la inglesa y devuelve un Map
 * fecha → parche con textos en español listo para aplicar.
 *
 * @param {string} esHtml - HTML de la página española
 * @param {Array<Object>} traces - Trazas registradas al parsear la página inglesa
 * @param {Array<Object>} enPatches - Parches ingleses (ya parseados)
 * @param {string} defaultDate
 */
function buildOfficialSpanishPatches(esHtml, traces, enPatches, defaultDate) {
    const replayTraces = traces.map(t => ({ ...t, replay: true }));
    const enIndexByDate = new Map();
    enPatches.forEach((p, i) => { if (!enIndexByDate.has(p.date)) enIndexByDate.set(p.date, i); });
    const sameCount = () => esPatchCount === enPatches.length;
    let esPatchCount = 0;

    // Cada parche español reutiliza la traza del parche inglés de la misma fecha
    // (o de la misma posición si la fecha no se puede leer y ambas páginas tienen los mismos parches).
    const traceLookup = (i, date, dateFromTitle) => {
        esPatchCount = Math.max(esPatchCount, i + 1);
        if (dateFromTitle && enIndexByDate.has(date)) return replayTraces[enIndexByDate.get(date)];
        return replayTraces[i] || { contexts: [], heroRoles: [], replay: true };
    };

    // Silenciar los logs del parser para no duplicar la salida
    const originalLog = console.log;
    let esPatches;
    try {
        console.log = () => {};
        esPatches = parseHTML(esHtml, defaultDate, { traceLookup });
    } finally {
        console.log = originalLog;
    }

    const result = new Map();
    const reasons = new Map();

    // Emparejar por fecha si Blizzard la incluye en el título; si no, por posición
    // (solo cuando ambas páginas tienen el mismo número de parches).
    const esByDate = new Map();
    esPatches.forEach(p => { if (p.dateFromTitle) esByDate.set(p.date, p); });
    const canMatchByIndex = sameCount();

    enPatches.forEach((enPatch, i) => {
        const esPatch = esByDate.get(enPatch.date) || (canMatchByIndex ? esPatches[i] : null);
        if (!esPatch) {
            reasons.set(enPatch.date, 'no está publicado en la página española');
            return;
        }
        const mismatch = findShapeMismatch(enPatch, esPatch);
        if (mismatch) {
            reasons.set(enPatch.date, `estructura distinta (${mismatch})`);
            return;
        }
        result.set(enPatch.date, esPatch);
    });

    return { patches: result, reasons };
}

module.exports = { getOfficialSpanishUrl, buildOfficialSpanishPatches, applySpanishText, findShapeMismatch };
