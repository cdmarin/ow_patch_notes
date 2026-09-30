/**
 * data.js — Carga de datos reales para las maquetas (parche del 8 de septiembre de 2026)
 */
import { HERO_PORTRAITS as PORTRAITS } from '../js/config.js';

export const PATCH_ID = '2026-09-08';

export const ROLE_META = {
    Tanque: { key: 'tank', label: 'Tanque' },
    'Daño': { key: 'damage', label: 'Daño' },
    Apoyo: { key: 'support', label: 'Apoyo' },
};

export const TYPE_META = {
    buff: { label: 'Mejora', short: 'Buff', icon: 'buff' },
    nerf: { label: 'Debilitación', short: 'Nerf', icon: 'nerf' },
    new: { label: 'Nuevo', short: 'Nuevo', icon: 'new' },
    rework: { label: 'Rework', short: 'Rework', icon: 'rework' },
    adjust: { label: 'Ajuste', short: 'Ajuste', icon: 'rework' },
};

export async function loadPatch(id = PATCH_ID) {
    const [patch, index] = await Promise.all([
        fetch(`../data/patches/${id}/patch.json`).then(r => r.json()),
        fetch('../data/patches_index.json').then(r => r.json()),
    ]);
    return { patch, index: index.patches };
}

export function heroesOf(section) {
    if (!section || !section.roles) return [];
    return Object.entries(section.roles).flatMap(([role, heroes]) => heroes.map(h => ({ ...h, role })));
}

export function countTypes(heroes) {
    const counts = { buff: 0, nerf: 0, new: 0, rework: 0, adjust: 0 };
    heroes.forEach(h => h.changes.forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1; }));
    return counts;
}

export function portraitOf(hero) {
    return hero.portrait || PORTRAITS[hero.name.toLowerCase()] || null;
}

export function initials(name) {
    return name.replace(/[^\p{L}\s.:]/gu, '').split(/[\s.:]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

/** Retrato con respaldo a iniciales si la imagen no carga */
export function avatar(hero, cls = 'avatar') {
    const src = portraitOf(hero);
    const fallback = `<span class="${cls} ${cls}--fallback" data-role="${ROLE_META[hero.role]?.key || ''}">${initials(hero.name)}</span>`;
    if (!src) return fallback;
    return `<img class="${cls}" src="${src}" alt="" onerror="this.outerHTML=this.dataset.fb" data-fb='${fallback.replace(/'/g, '&#39;')}'>`;
}

/**
 * Extrae "antes → después" de frases como "de 325 a 300", "a 30 (en lugar de 40)".
 */
const clean = (v) => v.trim().replace(/[.,]$/, '');

export function extractDiff(text) {
    let m = text.match(/de\s+([\d.,]+\s*(?:%|s|m|segundos?|metros|grados)?)\s+a\s+([\d.,]+\s*(?:%|s|m|segundos?|metros|grados)?)/i);
    if (m) return { from: clean(m[1]), to: clean(m[2]) };
    m = text.match(/(?:a|al)\s+([\d.,]+\s*%?\s*s?)\s*\(en lugar de(?:l)?\s+([\d.,]+\s*%?\s*s?)\)/i);
    if (m) return { from: clean(m[2]), to: clean(m[1]) };
    return null;
}

export function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
