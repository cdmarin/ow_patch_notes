/**
 * icons.js — Set de iconos propio (sustituye a los emojis del sistema)
 *
 * Todos en cuadrícula de 24×24, trazo de 1.75 y currentColor, así heredan el color del
 * texto y se ven igual en Windows, macOS, Android e iOS.
 * Uso: icon('search')  →  '<svg ...>...</svg>'
 *      En HTML estático: <i data-icon="search"></i> y hydrateIcons() al arrancar.
 */

const PATHS = {
    // ── Secciones ──
    gameBase: '<path d="M6.5 8h11a4 4 0 0 1 3.9 4.9l-1 4.3a2.3 2.3 0 0 1-3.9 1L14.6 16H9.4l-1.9 2.2a2.3 2.3 0 0 1-3.9-1l-1-4.3A4 4 0 0 1 6.5 8Z"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="15.5" cy="11.5" r=".6" fill="currentColor"/><circle cx="17.5" cy="13.5" r=".6" fill="currentColor"/>',
    stadium: '<ellipse cx="12" cy="8" rx="9" ry="3.2"/><path d="M3 8v6.5c0 1.8 4 3.3 9 3.3s9-1.5 9-3.3V8"/><path d="M7.5 17.2v-4M12 17.8v-4.2M16.5 17.2v-4"/><path d="M12 4.8V2.5l3 1-3 1"/>',
    arcade: '<rect x="5" y="3" width="14" height="18" rx="2"/><rect x="8" y="6" width="8" height="6" rx="1"/><circle cx="9.5" cy="16.5" r="1.3"/><path d="M14 15.5h2.5M14 17.5h2.5"/>',
    bugFixes: '<path d="M8.5 8.5a3.5 3.5 0 0 1 7 0"/><rect x="7" y="8.5" width="10" height="11" rx="5"/><path d="M12 12v7.5M3.5 13H7M17 13h3.5M4.5 8.5 7.3 10M19.5 8.5 16.7 10M4.5 18.5l2.8-1.8M19.5 18.5l-2.8-1.8M9.5 5 8 3M14.5 5 16 3"/>',
    maps: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z"/><path d="M9 4v14M15 6v14"/>',

    // ── Roles (diseño propio) ──
    tank: '<path d="M12 2.8 19.5 5.5v6c0 4.6-3.1 8.2-7.5 9.9-4.4-1.7-7.5-5.3-7.5-9.9v-6L12 2.8Z"/><path d="M12 7v9.5M8.5 10.5h7"/>',
    damage: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.2"/><path d="M12 1.8v4.4M12 17.8v4.4M1.8 12h4.4M17.8 12h4.4"/>',
    support: '<path d="M9.2 3.5h5.6v5.7h5.7v5.6h-5.7v5.7H9.2v-5.7H3.5V9.2h5.7Z"/>',
    allRoles: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><circle cx="12" cy="15.5" r="3"/>',

    // ── Tipos de cambio ──
    buff: '<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/>',
    nerf: '<path d="M12 5v14M5.5 12.5 12 19l6.5-6.5"/>',
    new: '<path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Z"/><path d="M19 16.5c.2 1.6 1 2.3 2.5 2.5-1.6.2-2.3 1-2.5 2.5-.2-1.6-1-2.3-2.5-2.5 1.6-.2 2.3-1 2.5-2.5Z"/>',
    rework: '<path d="M20 11a8 8 0 0 0-14.5-4.5M4 13a8 8 0 0 0 14.5 4.5"/><path d="M5.5 2.5v4h4M18.5 21.5v-4h-4"/>',

    // ── Acciones ──
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 3.5v5h-5"/>',
    download: '<path d="M12 3.5v11M7 10l5 5 5-5"/><path d="M4 16.5v2A2 2 0 0 0 6 20.5h12a2 2 0 0 0 2-2v-2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    expandAll: '<path d="M7 10l5-5 5 5M7 14l5 5 5-5"/>',
    collapseAll: '<path d="M7 5l5 5 5-5M7 19l5-5 5 5"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    language: '<path d="M3 5.5h9M7.5 3.5v2M5 5.5c.8 3.5 3.2 6 6 7.5M10 5.5c-.8 3.5-3.2 6-6 7.5"/><path d="m12.5 20.5 4-9.5 4 9.5M14 17h5"/>',

    // ── Estados / consola ──
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7L16 9.5"/>',
    error: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    warning: '<path d="M12 3.5 21.5 20h-19L12 3.5Z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".6" fill="currentColor"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9s-1.2 6.3-3.7 9c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3Z"/>',
    folder: '<path d="M3.5 6.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-11Z"/>',
    box: '<path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9L12 3Z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9"/>',
    hourglass: '<path d="M6.5 3h11M6.5 21h11M7.5 3c0 4.5 4.5 5.5 4.5 9s-4.5 4.5-4.5 9M16.5 3c0 4.5-4.5 5.5-4.5 9s4.5 4.5 4.5 9"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
};

export const ICON_NAMES = Object.keys(PATHS);

export function icon(name, { size = 20, stroke = 1.75, className = '' } = {}) {
    const body = PATHS[name];
    if (!body) return '';
    return `<svg class="ic ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

/**
 * Sustituye cada <i data-icon="nombre" data-size="18"> por su SVG.
 */
export function hydrateIcons(root = document) {
    root.querySelectorAll('i[data-icon]').forEach(el => {
        const svg = icon(el.dataset.icon, { size: Number(el.dataset.size) || 18, stroke: Number(el.dataset.stroke) || 1.75, className: el.className });
        if (svg) el.outerHTML = svg;
    });
}
