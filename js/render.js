import { dom } from './dom.js';
import { state } from './state.js';
import { SECTIONS, ROLES, ROLE_META, CHANGE_LABELS, CHANGE_ICONS } from './config.js';
import { getPortrait, formatDate, escapeHtml, initials, slugify, extractDiff } from './utils.js';
import { icon } from './icons.js';
import { startScrapeStream } from './stream.js';
import { switchSection, switchRole } from './handlers.js';
import { init, loadPatch } from '../app.js';

const TYPE_ORDER = ['buff', 'nerf', 'rework', 'new'];
const MAX_TIMELINE_ITEMS = 12;

/** 'adjust' se trata como 'rework' en filtros y colores */
const normType = (type) => (type === 'adjust' || !type ? 'rework' : type);

function sectionHasContent(sec, secData) {
    return !!secData && (
        (sec.hasRoles && secData.roles && Object.values(secData.roles).some(r => r.length > 0)) ||
        (sec.hasRoles && Array.isArray(secData.generalItems) && secData.generalItems.length > 0) ||
        (!sec.hasRoles && Array.isArray(secData) && secData.length > 0)
    );
}

/** Héroes (y objetos generales) de la sección actual, con su rol */
function entriesOf(section) {
    if (!section || !section.roles) return [];
    const entries = [];
    ROLES.forEach(role => (section.roles[role] || []).forEach(h => entries.push({ ...h, role })));
    (section.generalItems || []).forEach(item => entries.push({ ...item, role: '__general__' }));
    return entries;
}

function countTypes(entries) {
    const counts = { buff: 0, nerf: 0, rework: 0, new: 0 };
    entries.forEach(e => (e.changes || []).forEach(c => { counts[normType(c.type)]++; }));
    return counts;
}

// ─── Selector y línea temporal de parches ─────────────────────────────────────

export function renderPatchSelector(patches) {
    dom.patchSelect.innerHTML = patches.map(p => {
        const marker = p.isDownloaded !== false ? '' : ' · No descargado';
        return `<option value="${p.id}" ${p.isLatest ? 'selected' : ''}>${escapeHtml(p.title)}${p.isLatest ? ' · Último' : ''}${marker}</option>`;
    }).join('');
}

/**
 * Barra lateral: línea temporal con los parches descargados más recientes.
 */
export function renderSidebar() {
    let timelineWrap = dom.sidebar.querySelector('.sidebar-timeline');
    if (!timelineWrap) {
        timelineWrap = document.createElement('div');
        timelineWrap.className = 'sidebar-timeline';
        dom.sidebar.appendChild(timelineWrap);
    }

    const currentId = dom.patchSelect.value;
    const downloaded = (state.allPatches || []).filter(p => p.isDownloaded);
    let items = downloaded.slice(0, MAX_TIMELINE_ITEMS);
    const current = downloaded.find(p => p.id === currentId);
    if (current && !items.includes(current)) items = [...items.slice(0, MAX_TIMELINE_ITEMS - 1), current];

    timelineWrap.innerHTML = `
        <div class="sidebar-label">Parches</div>
        <ol class="timeline">
            ${items.map(p => {
                const date = p.date || p.id;
                const weekday = /^\d{4}-\d{2}-\d{2}$/.test(date)
                    ? new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long' })
                    : '';
                return `<li><button class="timeline-item ${p.id === currentId ? 'active' : ''}" data-patch-id="${p.id}" ${p.id === currentId ? 'aria-current="true"' : ''}>
                    <span class="timeline-title">${escapeHtml(p.title.replace(/ \d{4}$/, ''))}</span>
                    <span class="timeline-sub">${weekday}${p.isLatest ? ' · Último' : ''}</span>
                </button></li>`;
            }).join('')}
        </ol>
        <p class="sidebar-hint">Los parches anteriores están en el selector de arriba.</p>
    `;

    timelineWrap.querySelectorAll('.timeline-item').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.patchId;
            if (id === dom.patchSelect.value) return;
            dom.patchSelect.value = id;
            closeDrawer();
            loadPatch(id);
        };
    });
    handleMobileLayout();
}

function closeDrawer() {
    dom.sidebar.classList.remove('open');
    dom.drawerOverlay?.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// ─── Cabecera del parche ──────────────────────────────────────────────────────

window.togglePatchDesc = function (btn) {
    const span = btn.previousElementSibling;
    const expand = btn.dataset.expanded !== 'true';
    span.textContent = expand ? span.dataset.full : span.dataset.short;
    btn.textContent = expand ? 'Ver menos' : 'Ver más';
    btn.dataset.expanded = String(expand);
};

function meter(label, value, share, cls) {
    return `<div class="meter cut ${cls}" style="--p:${Math.round(share * 100)}%">
        <b>${value}</b><span>${label}</span><i></i>
    </div>`;
}

export function renderPatchHeader(patchData, patchMeta) {
    if (!dom.patchHeaderCard) return;
    const secConfig = SECTIONS.find(s => s.id === state.currentSection);
    const section = patchData.sections?.[state.currentSection];
    const bugFixes = patchData.sections?.bugFixes || [];
    const title = patchData.title || patchMeta?.title || 'Notas de parche';

    let heading;
    let lede = '';
    let meters = '';

    if (secConfig?.hasRoles) {
        const entries = entriesOf(section);
        const heroes = entries.filter(e => e.role !== '__general__');
        const counts = countTypes(entries);
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

        heading = heroes.length > 0
            ? `Cambios para <em>${heroes.length} ${heroes.length === 1 ? 'héroe' : 'héroes'}</em>`
            : `<em>${entries.length}</em> ${entries.length === 1 ? 'cambio general' : 'cambios generales'}`;

        const parts = [];
        if (counts.buff) parts.push(`<b class="t-buff">${counts.buff} ${counts.buff === 1 ? 'mejora' : 'mejoras'}</b>`);
        if (counts.nerf) parts.push(`<b class="t-nerf">${counts.nerf} ${counts.nerf === 1 ? 'debilitación' : 'debilitaciones'}</b>`);
        if (counts.rework) parts.push(`${counts.rework} ${counts.rework === 1 ? 'ajuste' : 'ajustes'}`);
        if (counts.new) parts.push(`<b class="t-new">${counts.new} ${counts.new === 1 ? 'novedad' : 'novedades'}</b>`);
        if (parts.length) {
            const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}` : parts[0];
            lede = `En ${secConfig.label.toLowerCase()}: ${list}${bugFixes.length ? `, además de ${bugFixes.length} ${bugFixes.length === 1 ? 'corrección' : 'correcciones'} de errores` : ''}.`;
        }

        meters = [
            meter('Mejoras', counts.buff, counts.buff / total, 't-buff'),
            meter('Debilitaciones', counts.nerf, counts.nerf / total, 't-nerf'),
            meter('Ajustes', counts.rework, counts.rework / total, 't-rework'),
            counts.new ? meter('Novedades', counts.new, counts.new / total, 't-new') : '',
            bugFixes.length ? meter('Correcciones', bugFixes.length, 1, 't-accent') : ''
        ].join('');
    } else {
        const n = Array.isArray(section) ? section.length : 0;
        heading = `<em>${n}</em> ${n === 1 ? 'corrección de errores' : 'correcciones de errores'}`;
    }

    // Introducción de la sección (texto de Blizzard), recortada si es larga
    const intro = (secConfig?.hasRoles ? section?.intro : '') || '';
    const maxLength = window.innerWidth <= 768 ? 140 : 320;
    let introHtml = '';
    if (intro) {
        if (intro.length > maxLength) {
            const short = intro.substring(0, maxLength).trim() + '…';
            introHtml = `<p class="patch-intro"><span class="desc-text" data-full="${escapeHtml(intro)}" data-short="${escapeHtml(short)}">${escapeHtml(short)}</span>
                <button class="toggle-desc-btn" onclick="togglePatchDesc(this)">Ver más</button></p>`;
        } else {
            introHtml = `<p class="patch-intro">${escapeHtml(intro)}</p>`;
        }
    }

    const sourceBadge = state.currentPatch === state.originalPatch && state.originalPatch
        ? '<span class="kicker-chip cut">Original en inglés</span>'
        : (patchData.translationSource === 'official' ? '<span class="kicker-chip cut">Traducción oficial</span>' : '');

    dom.patchHeaderCard.innerHTML = `
        <div class="kicker">
            ${icon('calendar', { size: 15 })}
            <span>${escapeHtml(title)}</span>
            <span class="kicker-chip cut">${icon(secConfig?.icon || 'gameBase', { size: 13 })}${escapeHtml(secConfig?.label || '')}</span>
            ${sourceBadge}
        </div>
        <h1 class="patch-card-title">${heading}</h1>
        ${lede ? `<p class="patch-lede">${lede}</p>` : ''}
        ${introHtml}
        ${meters ? `<div class="meters">${meters}</div>` : ''}
    `;
}

// ─── Tarjetas ─────────────────────────────────────────────────────────────────

function portraitHtml(hero) {
    const src = getPortrait(hero.name, hero.portrait);
    const fallback = `<span class="hero-portrait hero-portrait--fallback" aria-hidden="true">${escapeHtml(initials(hero.name))}</span>`;
    if (!src) return fallback;
    return `<img class="hero-portrait" src="${escapeHtml(src)}" alt="" draggable="false" loading="lazy"
        data-fb="${escapeHtml(fallback)}" onerror="this.outerHTML=this.dataset.fb">`;
}

function abilityIconHtml(change, type) {
    const typeIcon = icon(CHANGE_ICONS[type], { size: 20, stroke: 2.2 });
    if (!change.icon) return `<span class="abil" aria-hidden="true">${typeIcon}</span>`;
    const badge = `<span class="abil-type">${icon(CHANGE_ICONS[type], { size: 11, stroke: 3 })}</span>`;
    return `<span class="abil" aria-hidden="true"><img src="${escapeHtml(change.icon)}" alt="" draggable="false" loading="lazy"
        data-fb="${escapeHtml(typeIcon)}" onerror="this.parentNode.innerHTML=this.dataset.fb">${badge}</span>`;
}

export function renderChangeItem(change) {
    const type = normType(change.type);
    const label = CHANGE_LABELS[type] || type;
    const details = (change.details || []).filter(d => d && d !== change.title);

    return `
        <li class="change-item ${type}">
            ${abilityIconHtml(change, type)}
            <div class="change-body">
                <h4 class="change-title"><span class="sr-only">${label}: </span>${escapeHtml(change.title)}</h4>
                ${details.length ? `<ul class="change-details">${details.map(d => {
                    const diff = extractDiff(d);
                    return `<li><span>${escapeHtml(d)}</span>${diff ? `<span class="diff cut"><s>${escapeHtml(diff.from)}</s>${icon('chevronDown', { size: 12, stroke: 2.4, className: 'diff-arrow' })}<b>${escapeHtml(diff.to)}</b></span>` : ''}</li>`;
                }).join('')}</ul>` : ''}
            </div>
        </li>
    `;
}

export function renderHeroCard(hero, isOpen = true) {
    const roleMeta = ROLE_META[hero.role] || ROLE_META.__general__;
    const counts = countTypes([hero]);
    const tally = TYPE_ORDER.filter(t => counts[t])
        .map(t => `<span class="tally-chip cut ${t}" title="${CHANGE_LABELS[t]}">${icon(CHANGE_ICONS[t], { size: 12, stroke: 2.6 })}${counts[t]}</span>`)
        .join('');
    const nChanges = (hero.changes || []).length;
    const desc = (hero.desc || '').replace(/^Comentarios de los desarrolladores:\s*/i, '').replace(/^Developer comments?:\s*/i, '');

    return `
        <details class="hero-card cut role-${roleMeta.key}" id="hero-${slugify(hero.name)}" ${isOpen ? 'open' : ''}>
            <summary class="hero-header">
                ${portraitHtml(hero)}
                <div class="hero-header-info">
                    <div class="hero-name">${escapeHtml(hero.name)}</div>
                    <div class="hero-meta">${icon(roleMeta.icon, { size: 13 })}${hero.role === '__general__' ? 'General' : escapeHtml(hero.role)} · ${nChanges} ${nChanges === 1 ? 'cambio' : 'cambios'}</div>
                </div>
                <div class="hero-changes-preview">${tally}</div>
                <span class="hero-chevron">${icon('chevronDown', { size: 18 })}</span>
            </summary>
            <div class="hero-content">
                <div class="hero-content-inner">
                    ${desc ? `<div class="hero-desc cut"><div class="hero-desc-label">${icon('info', { size: 14 })}Nota de los desarrolladores</div><p>${escapeHtml(desc)}</p></div>` : ''}
                    <ul class="changes-list">${(hero.changes || []).map(renderChangeItem).join('')}</ul>
                </div>
            </div>
        </details>
    `;
}

// Expandir/colapsar todas las tarjetas de un rol
window.toggleSectionCards = function (btn, shouldExpand) {
    const section = btn.closest('.role-section') || btn.closest('.content');
    if (!section) return;

    section.querySelectorAll('.hero-card').forEach(card => {
        const content = card.querySelector('.hero-content');
        if (!content || content.style.transition) return;

        if (shouldExpand && !card.open) {
            card.setAttribute('open', '');
            const height = content.scrollHeight;
            content.style.height = '0';
            content.style.opacity = '0';
            content.style.transition = 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-out';
            content.offsetHeight; // Reflow
            content.style.height = `${height}px`;
            content.style.opacity = '1';
            const onEnd = () => {
                content.style.height = '';
                content.style.opacity = '';
                content.style.transition = '';
                content.removeEventListener('transitionend', onEnd);
            };
            content.addEventListener('transitionend', onEnd);
        } else if (!shouldExpand && card.open) {
            const height = content.scrollHeight;
            content.style.height = `${height}px`;
            content.offsetHeight; // Reflow
            content.style.transition = 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out';
            content.style.height = '0';
            content.style.opacity = '0';
            const onEnd = () => {
                card.removeAttribute('open');
                content.style.height = '';
                content.style.opacity = '';
                content.style.transition = '';
                content.removeEventListener('transitionend', onEnd);
            };
            content.addEventListener('transitionend', onEnd);
        }
    });
};

// ─── Contenido ────────────────────────────────────────────────────────────────

export function clearContentSafely() {
    const searchWrap = document.querySelector('.search-wrap');
    if (searchWrap && searchWrap.parentElement === dom.content) {
        document.querySelector('header')?.insertBefore(searchWrap, document.getElementById('lang-toggle-btn'));
    }
    dom.content.innerHTML = '';
}

/** Pestañas de sección + filtros por rol y tipo de cambio */
function renderSectionBar(patchData) {
    const bar = document.createElement('div');
    bar.className = 'section-bar';

    const tabs = SECTIONS.filter(sec => sectionHasContent(sec, patchData?.sections?.[sec.id])).map(sec => {
        const secData = patchData.sections[sec.id];
        const n = sec.hasRoles ? entriesOf(secData).length : secData.length;
        return `<button class="section-tab ${state.currentSection === sec.id ? 'active' : ''}" data-section="${sec.id}">
            ${icon(sec.icon, { size: 18 })}<span>${sec.label}</span><em>${n}</em></button>`;
    }).join('');

    const secConfig = SECTIONS.find(s => s.id === state.currentSection);
    let pills = '';
    if (secConfig?.hasRoles) {
        const section = patchData?.sections?.[state.currentSection];
        const roleBtn = (role, label, iconName, n) =>
            `<button class="pill role-btn cut ${state.currentRole === role ? 'active' : ''}" data-role="${role}">${icon(iconName, { size: 15 })}${label}<span class="hero-count">${n}</span></button>`;
        const roles = [roleBtn('Todos', 'Todos', 'allRoles', entriesOf(section).length)];
        ROLES.forEach(role => {
            const n = (section?.roles?.[role] || []).length;
            if (n) roles.push(roleBtn(role, ROLE_META[role].label, ROLE_META[role].icon, n));
        });
        if (section?.generalItems?.length) roles.push(roleBtn('__general__', 'General', 'maps', section.generalItems.length));

        const filters = TYPE_ORDER.map(t =>
            `<button class="pill filter-chip cut ${t} ${state.activeFilters.has(t) ? 'active' : ''}" data-filter="${t}" aria-pressed="${state.activeFilters.has(t)}">${icon(CHANGE_ICONS[t], { size: 15, stroke: 2.4 })}${CHANGE_LABELS[t]}</button>`
        ).join('');

        pills = `<div class="pills"><div class="pill-group" role="group" aria-label="Filtrar por rol">${roles.join('')}</div>
            <span class="pill-sep" aria-hidden="true"></span>
            <div class="pill-group filter-wrap" role="group" aria-label="Filtrar por tipo de cambio">${filters}</div></div>`;
    }

    bar.innerHTML = `${tabs ? `<div class="section-tabs" role="tablist">${tabs}</div>` : ''}${pills}`;
    bar.querySelectorAll('.section-tab').forEach(btn => { btn.onclick = () => switchSection(btn.dataset.section); });
    bar.querySelectorAll('.role-btn').forEach(btn => { btn.onclick = () => switchRole(btn.dataset.role); });
    return bar;
}

function renderRoleSection(role, entries) {
    const meta = ROLE_META[role];
    const roleSection = document.createElement('section');
    roleSection.className = `role-section role-${meta.key} ${state.currentRole === 'Todos' || state.currentRole === role ? 'active' : ''}`;
    roleSection.id = `role-${role}`;
    roleSection.innerHTML = `
        <h2 class="role-section-title">
            <span class="role-plate cut">${icon(meta.icon, { size: 19 })}</span>
            <span class="role-name">${role === '__general__' ? 'Objetos generales y mapas' : meta.label}</span>
            <span class="role-line" aria-hidden="true"></span>
            <span class="section-actions">
                <button class="action-btn" onclick="toggleSectionCards(this, true)" title="Expandir todo" aria-label="Expandir todas las tarjetas">${icon('expandAll', { size: 16 })}</button>
                <button class="action-btn" onclick="toggleSectionCards(this, false)" title="Colapsar todo" aria-label="Colapsar todas las tarjetas">${icon('collapseAll', { size: 16 })}</button>
            </span>
        </h2>
    `;
    entries.forEach(entry => {
        const el = document.createElement('div');
        el.innerHTML = renderHeroCard(entry).trim();
        const card = el.firstElementChild;
        card.dataset.hero = entry.name.toLowerCase();
        card.dataset.types = (entry.changes || []).map(c => normType(c.type)).join(',');
        roleSection.appendChild(card);
    });
    return roleSection;
}

export function renderContent(patchData) {
    clearContentSafely();

    const fragment = document.createDocumentFragment();

    const headerCard = document.createElement('div');
    headerCard.id = 'patch-header-card';
    headerCard.className = 'patch-header-card';
    dom.patchHeaderCard = headerCard;
    fragment.appendChild(headerCard);
    fragment.appendChild(renderSectionBar(patchData));

    const section = patchData?.sections?.[state.currentSection];
    const currentSecConfig = SECTIONS.find(s => s.id === state.currentSection);

    if (!section || (currentSecConfig?.hasRoles && !section.roles)) {
        fragment.appendChild(createEmptySection('Próximamente', 'Esta sección se llenará automáticamente con el scraper en el próximo parche.'));
    } else if (currentSecConfig?.hasRoles) {
        ROLES.forEach(role => {
            const heroes = (section.roles?.[role] || []).map(h => ({ ...h, role }));
            if (heroes.length) fragment.appendChild(renderRoleSection(role, heroes));
        });
        if (section.generalItems?.length > 0) {
            fragment.appendChild(renderRoleSection('__general__', section.generalItems.map(item => ({ ...item, role: '__general__' }))));
        }
    } else {
        const flat = Array.isArray(section) ? section : [];
        if (flat.length === 0) {
            fragment.appendChild(createEmptySection('Próximamente', 'Esta sección se completará con el scraper.'));
        } else {
            const card = document.createElement('section');
            card.className = 'bugfix-card cut';
            card.innerHTML = `
                <h2 class="role-section-title">
                    <span class="role-plate cut">${icon('bugFixes', { size: 19 })}</span>
                    <span class="role-name">Corrección de errores</span>
                    <span class="role-line" aria-hidden="true"></span>
                </h2>
                <ul class="bug-fixes-list">${flat.map(bug => `<li>${escapeHtml(bug)}</li>`).join('')}</ul>
            `;
            fragment.appendChild(card);
        }
    }

    dom.content.appendChild(fragment);
    renderToc(patchData);
    handleMobileLayout();
}

// ─── Índice lateral ───────────────────────────────────────────────────────────

export function renderToc(patchData) {
    const toc = document.getElementById('toc');
    if (!toc) return;
    const secConfig = SECTIONS.find(s => s.id === state.currentSection);
    const entries = secConfig?.hasRoles ? entriesOf(patchData?.sections?.[state.currentSection]) : [];

    if (entries.length === 0) {
        toc.innerHTML = '';
        toc.classList.add('empty');
        return;
    }
    toc.classList.remove('empty');
    toc.innerHTML = `
        <div class="toc-inner">
            <div class="sidebar-label">En este parche</div>
            <ul class="toc-list">
                ${entries.map(e => {
                    const meta = ROLE_META[e.role] || ROLE_META.__general__;
                    const segs = TYPE_ORDER.flatMap(t => (e.changes || []).filter(c => normType(c.type) === t).map(() => `<i class="${t}"></i>`)).join('');
                    return `<li><a href="#hero-${slugify(e.name)}" class="toc-link role-${meta.key}" data-role="${e.role}">${icon(meta.icon, { size: 14 })}<span>${escapeHtml(e.name)}</span><span class="segs" aria-hidden="true">${segs}</span></a></li>`;
                }).join('')}
            </ul>
            <div class="toc-legend"><span class="buff">Mejora</span><span class="nerf">Nerf</span><span class="rework">Ajuste</span></div>
        </div>
    `;

    toc.querySelectorAll('.toc-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            // Si el héroe está oculto por el filtro de rol, volver a "Todos"
            if (state.currentRole !== 'Todos' && state.currentRole !== link.dataset.role) switchRole('Todos');
            const card = document.querySelector(link.getAttribute('href'));
            if (!card) return;
            if (!card.open) card.setAttribute('open', '');
            card.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
            card.classList.remove('flash');
            void card.offsetWidth;
            card.classList.add('flash');
        };
    });
}

// ─── Estados vacíos ───────────────────────────────────────────────────────────

export function createEmptySection(title, desc, iconName = 'hourglass') {
    const el = document.createElement('div');
    el.className = 'empty-section cut';
    el.innerHTML = `
        <div class="empty-section-icon">${icon(iconName, { size: 34, stroke: 1.5 })}</div>
        <div class="empty-section-title">${escapeHtml(title)}</div>
        <div class="empty-section-desc">${escapeHtml(desc)}</div>
    `;
    return el;
}

export function renderContentNotDownloaded(patchMeta) {
    const [year, month] = patchMeta.id.split('-');
    const autoUrl = `https://overwatch.blizzard.com/en-us/news/patch-notes/live/${year}/${month}`;
    const isStaticMode = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:';

    clearContentSafely();
    const toc = document.getElementById('toc');
    if (toc) { toc.innerHTML = ''; toc.classList.add('empty'); }

    dom.content.innerHTML = `
        <div class="patch-header-card" id="patch-header-card">
            <div class="kicker">${icon('download', { size: 15 })}<span>No descargado</span></div>
            <h1 class="patch-card-title">${escapeHtml(patchMeta.title)}</h1>
            <p class="patch-lede">Este parche todavía no está guardado en la aplicación.</p>
        </div>
        <div class="empty-section cut">
            <div class="empty-section-icon">${icon('globe', { size: 34, stroke: 1.5 })}</div>
            <div class="empty-section-title">Descargar notas de parche</div>
            <div class="empty-section-desc">
                ${isStaticMode
                    ? 'Las actualizaciones se ejecutan automáticamente cada día en el servidor, así que este parche se publicará en las próximas horas.'
                    : `Se descargará y traducirá desde la web oficial de Blizzard:<br><a href="${autoUrl}" target="_blank" rel="noopener">${autoUrl}</a>`}
            </div>
            ${isStaticMode ? '' : `<button id="scrape-custom-btn" class="primary-btn cut">${icon('download', { size: 17 })}<span>Descargar y procesar</span></button>`}
        </div>
    `;
    dom.patchHeaderCard = document.getElementById('patch-header-card');

    const scrapeBtn = document.getElementById('scrape-custom-btn');
    if (scrapeBtn) {
        scrapeBtn.onclick = async () => {
            const label = scrapeBtn.querySelector('span');
            scrapeBtn.disabled = true;
            label.textContent = 'Descargando…';
            dom.refreshBtn?.classList.add('spinning');

            await startScrapeStream(`?url=${encodeURIComponent(autoUrl)}`, async () => {
                await init(true);
                const matchingPatches = state.allPatches.filter(p => p.id === patchMeta.id || p.id.startsWith(patchMeta.id + '-'));
                const targetPatch = matchingPatches.find(p => p.isDownloaded) || matchingPatches[0] || patchMeta;
                dom.patchSelect.value = targetPatch.id;
                await loadPatch(targetPatch.id);
            });

            scrapeBtn.disabled = false;
            label.textContent = 'Descargar y procesar';
            dom.refreshBtn?.classList.remove('spinning');
        };
    }
    handleMobileLayout();
}

// ─── Adaptación a móvil ───────────────────────────────────────────────────────

/**
 * En móvil (≤768px) el selector de parches pasa al cajón lateral y la búsqueda
 * baja al contenido, bajo la cabecera del parche.
 */
export function handleMobileLayout() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const searchWrap = document.querySelector('.search-wrap');
    const patchSelectorWrap = document.querySelector('.patch-selector-wrap');
    const sidebar = dom.sidebar;
    const header = document.querySelector('header');
    if (!sidebar || !header) return;

    if (isMobile) {
        if (patchSelectorWrap && patchSelectorWrap.parentElement !== sidebar) {
            sidebar.insertBefore(patchSelectorWrap, sidebar.firstChild);
        }
        const headerCard = document.getElementById('patch-header-card');
        if (searchWrap && headerCard && headerCard.parentElement === dom.content && searchWrap.previousElementSibling !== headerCard) {
            dom.content.insertBefore(searchWrap, headerCard.nextSibling);
        }
    } else {
        const spacer = header.querySelector('.header-spacer');
        if (patchSelectorWrap && patchSelectorWrap.parentElement !== header) {
            header.insertBefore(patchSelectorWrap, spacer);
        }
        if (searchWrap && searchWrap.parentElement !== header) {
            header.insertBefore(searchWrap, document.getElementById('lang-toggle-btn'));
        }
    }
}
