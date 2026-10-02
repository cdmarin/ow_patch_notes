import { HERO_PORTRAITS, FALLBACK_PORTRAIT } from './config.js';
import { state } from './state.js';

export function getPortrait(name, portraitUrl) {
    if (portraitUrl) return portraitUrl;
    const key = name.toLowerCase().trim();
    if (HERO_PORTRAITS[key]) return HERO_PORTRAITS[key];
    return null;
}

/**
 * ¿La app se está viendo como web estática (GitHub Pages, dominio propio, archivo local)?
 * Solo el servidor local (server.js) puede descargar parches, así que se considera "local"
 * únicamente localhost o una IP de la red de casa.
 */
export function isStaticSite() {
    const { protocol, hostname } = window.location;
    if (protocol === 'file:') return true;
    const isLocal = hostname === 'localhost' || hostname === '::1' || hostname === '[::1]' ||
        /^127\./.test(hostname) || /^192\.168\./.test(hostname) || /^10\./.test(hostname) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) || hostname.endsWith('.local');
    return !isLocal;
}

export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Iniciales para el retrato de respaldo ("Soldier: 76" → "S7", "D.Va" → "DV") */
export function initials(name) {
    return String(name || '?').split(/[\s.:\-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
}

/** Identificador estable para anclas ("Wrecking Ball" → "wrecking-ball") */
export function slugify(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const UNIT = String.raw`(?:\s*(?:%|s\b|m\b|segundos?|metros|grados|seconds?|meters|degrees))?`;
const NUM = String.raw`[+-]?\d+(?:[.,]\d+)?`;
const DIFF_PATTERNS = [
    // "de 325 a 300", "from 325 to 300"
    { re: new RegExp(`(?:de|from)\\s+(${NUM}${UNIT})\\s+(?:a|to)\\s+(${NUM}${UNIT})`, 'i'), from: 1, to: 2 },
    // "a 30 (en lugar de 40)", "to 30 (was 40)"
    { re: new RegExp(`(?:a|al|to)\\s+(${NUM}${UNIT})\\s*\\((?:en lugar de(?:l)?|was|up from|down from|from)\\s+(${NUM}${UNIT})\\)`, 'i'), from: 2, to: 1 },
];

/**
 * Extrae "antes → después" de un detalle de cambio, si lo tiene.
 * @returns {{from: string, to: string} | null}
 */
export function extractDiff(text) {
    const clean = (v) => v.trim().replace(/[.,]$/, '');
    for (const { re, from, to } of DIFF_PATTERNS) {
        const m = String(text || '').match(re);
        if (m) return { from: clean(m[from]), to: clean(m[to]) };
    }
    return null;
}

export function formatDate(dateStr) {
    if (!dateStr) return '—';
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const [year, month, day] = dateStr.split('-');
    return `${day ? day + ' de ' : ''}${months[parseInt(month) - 1]} ${year}`;
}

export function countByType(heroes, type) {
    if (!Array.isArray(heroes)) return 0;
    return heroes.reduce((acc, hero) => {
        return acc + (hero.changes || []).filter(c => c.type === type).length;
    }, 0);
}

export function getAllHeroes(patchData) {
    if (!patchData || !patchData.sections) return 0;
    const heroes = new Set();
    const addFromSection = (section) => {
        if (!section || !section.roles) return;
        Object.values(section.roles).forEach(roleHeroes => {
            if (Array.isArray(roleHeroes)) roleHeroes.forEach(h => heroes.add(h.name));
        });
    };
    Object.values(patchData.sections).forEach(section => {
        addFromSection(section);
    });
    return heroes.size;
}

export function countAllChanges(patchData) {
    if (!patchData || !patchData.sections) return 0;
    let count = 0;
    const countSection = (section) => {
        if (!section) return;
        if (section.roles) {
            Object.values(section.roles).forEach(heroes => {
                if (Array.isArray(heroes)) heroes.forEach(h => count += (h.changes || []).length);
            });
        }
        if (Array.isArray(section.generalItems)) {
            section.generalItems.forEach(item => count += (item.changes || []).length);
        }
    };
    Object.values(patchData.sections).forEach(section => {
        countSection(section);
    });
    return count;
}
