import { dom } from './dom.js';
import { state } from './state.js';
import { SECTIONS, ROLES, CHANGE_LABELS, FALLBACK_PORTRAIT } from './config.js';
import { getPortrait, getAllHeroes, countAllChanges, formatDate } from './utils.js';
import { startScrapeStream } from './stream.js';
import { switchSection, switchRole } from './handlers.js';
import { init, loadPatch } from '../app.js';

export function renderPatchSelector(patches) {
    dom.patchSelect.innerHTML = patches.map(p => {
        const marker = p.isDownloaded !== false ? '' : ' 📥 (No descargado)';
        return `<option value="${p.id}" ${p.isLatest ? 'selected' : ''}>
            ${p.title}${p.isLatest ? ' ✦' : ''}${marker}
        </option>`;
    }).join('');
}

export function renderSidebar(patchData) {
    dom.sidebar.innerHTML = '';

    const sectionGroup = document.createElement('div');
    sectionGroup.className = 'sidebar-group';
    sectionGroup.innerHTML = '<div class="sidebar-group-label">Sección</div>';

    SECTIONS.forEach(sec => {
        const secData = patchData?.sections?.[sec.id];
        const hasContent = secData && (
            (sec.hasRoles && secData.roles && Object.values(secData.roles).some(r => r.length > 0)) ||
            (sec.hasRoles && Array.isArray(secData.generalItems) && secData.generalItems.length > 0) ||
            (!sec.hasRoles && Array.isArray(secData) && secData.length > 0)
        );

        if (!hasContent) return;

        const btn = document.createElement('button');
        btn.className = `section-tab ${state.currentSection === sec.id ? 'active' : ''}`;
        btn.dataset.section = sec.id;
        btn.innerHTML = `
            <span class="tab-icon">${sec.icon}</span>
            ${sec.label}
        `;
        btn.onclick = () => switchSection(sec.id);
        sectionGroup.appendChild(btn);
    });

    if (sectionGroup.children.length > 1) {
        dom.sidebar.appendChild(sectionGroup);
    }

    const currentSec = SECTIONS.find(s => s.id === state.currentSection);
    if (currentSec?.hasRoles) {
        const divider = document.createElement('div');
        divider.className = 'sidebar-divider';
        dom.sidebar.appendChild(divider);

        const roleGroup = document.createElement('div');
        roleGroup.className = 'sidebar-group';
        roleGroup.innerHTML = '<div class="sidebar-group-label">Rol</div>';

        const sectionData = patchData?.sections?.[state.currentSection];

        let totalHeroes = 0;
        ROLES.forEach(r => {
            totalHeroes += (sectionData?.roles?.[r] || []).length;
        });
        if (sectionData?.generalItems?.length > 0) {
            totalHeroes += sectionData.generalItems.length;
        }

        const todosBtn = document.createElement('button');
        todosBtn.className = `role-btn ${state.currentRole === 'Todos' ? 'active' : ''}`;
        todosBtn.dataset.role = 'Todos';
        todosBtn.innerHTML = `
            <span class="role-dot"></span>
            Todos
            <span class="hero-count">${totalHeroes}</span>
        `;
        todosBtn.onclick = () => switchRole('Todos');
        roleGroup.appendChild(todosBtn);

        ROLES.forEach(role => {
            const heroes = sectionData?.roles?.[role] || [];
            const btn = document.createElement('button');
            btn.className = `role-btn ${state.currentRole === role ? 'active' : ''}`;
            btn.dataset.role = role;
            btn.innerHTML = `
                <span class="role-dot"></span>
                ${role}
                <span class="hero-count">${heroes.length}</span>
            `;
            btn.onclick = () => switchRole(role);
            roleGroup.appendChild(btn);
        });

        if (sectionData?.generalItems?.length > 0) {
            const generalBtn = document.createElement('button');
            generalBtn.className = `role-btn ${state.currentRole === '__general__' ? 'active' : ''}`;
            generalBtn.dataset.role = '__general__';
            generalBtn.innerHTML = `
                <span class="role-dot"></span>
                General & Mapas
                <span class="hero-count">${sectionData.generalItems.length}</span>
            `;
            generalBtn.onclick = () => switchRole('__general__');
            roleGroup.appendChild(generalBtn);
        }

        dom.sidebar.appendChild(roleGroup);
    }
}

export function renderPatchHeader(patchData, patchMeta) {
    const heroCount = getAllHeroes(patchData);
    const changeCount = countAllChanges(patchData);

    dom.patchHeaderCard.innerHTML = `
        <h1 class="patch-card-title">${patchData.title || patchMeta?.title || 'Notas de Parche'}</h1>
        <p class="patch-card-desc">${patchData.sections?.stadium?.intro || patchMeta?.subtitle || ''}</p>
        <div class="patch-stats">
            <div class="patch-stat">
                <span class="patch-stat-value">${heroCount}</span>
                <span class="patch-stat-label">Héroes afectados</span>
            </div>
            <div class="patch-stat">
                <span class="patch-stat-value">${changeCount}</span>
                <span class="patch-stat-label">Cambios totales</span>
            </div>
            <div class="patch-stat">
                <span class="patch-stat-value">${patchData.date ? formatDate(patchData.date) : '—'}</span>
                <span class="patch-stat-label">Fecha de actualización de datos</span>
            </div>
        </div>
    `;
}

export function renderChangeItem(change) {
    const type = change.type || 'adjust';
    const label = CHANGE_LABELS[type] || type;
    const details = (change.details || []).map(d => `<li>${d}</li>`).join('');

    return `
        <li class="change-item ${type}">
            <div class="change-header">
                <span class="change-badge ${type}">${label}</span>
                <span class="change-title">${change.title}</span>
            </div>
            ${details ? `<ul class="change-details">${details}</ul>` : ''}
        </li>
    `;
}

export function renderHeroCard(hero, isOpen = false) {
    const portrait = getPortrait(hero.name, hero.portrait);

    const typeCounts = {};
    (hero.changes || []).forEach(c => {
        const t = c.type || 'adjust';
        typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    const badges = Object.entries(typeCounts)
        .map(([type, count]) => `<span class="mini-badge ${type}">${CHANGE_LABELS[type] || type} ×${count}</span>`)
        .join('');

    const changesHtml = (hero.changes || []).map(c => renderChangeItem(c)).join('');

    return `
        <details class="hero-card" ${isOpen ? 'open' : ''}>
            <summary class="hero-header">
                <img class="hero-portrait" src="${portrait}" 
                     alt="${hero.name}"
                     onerror="this.onerror=null; this.src=document.body.classList.contains('light-theme') ? 'logo-light.svg' : 'logo.svg'">
                <div class="hero-header-info">
                    <div class="hero-name">${hero.name}</div>
                    <div class="hero-changes-preview">${badges}</div>
                </div>
                <span class="hero-chevron">▼</span>
            </summary>
            <div class="hero-content">
                ${hero.desc ? `<p class="hero-desc">${hero.desc}</p>` : ''}
                <ul class="changes-list">${changesHtml}</ul>
            </div>
        </details>
    `;
}

export function renderContent(patchData) {
    dom.content.innerHTML = '';

    const headerCard = document.createElement('div');
    headerCard.id = 'patch-header-card';
    headerCard.className = 'patch-header-card';
    dom.patchHeaderCard = headerCard;
    dom.content.appendChild(headerCard);

    const section = patchData?.sections?.[state.currentSection];
    const currentSecConfig = SECTIONS.find(s => s.id === state.currentSection);

    if (!section || (currentSecConfig?.hasRoles && !section.roles)) {
        dom.content.appendChild(createEmptySection('Próximamente', 'Esta sección se llenará automáticamente con el scraper en el próximo parche.'));
        return;
    }

    if (currentSecConfig?.hasRoles) {
        ROLES.forEach(role => {
            const heroes = section.roles?.[role] || [];

            if (state.currentRole === 'Todos' && heroes.length === 0) {
                return;
            }

            const roleSection = document.createElement('div');
            roleSection.className = `role-section ${state.currentRole === 'Todos' || state.currentRole === role ? 'active' : ''}`;
            roleSection.id = `role-${role}`;

            if (heroes.length === 0) {
                roleSection.innerHTML = `<h2 class="role-section-title">${role}</h2>`;
                roleSection.appendChild(createEmptySection('Sin cambios', `No hay cambios de ${role} en este parche.`));
            } else {
                roleSection.innerHTML = `<h2 class="role-section-title">${role}</h2>`;
                heroes.forEach(hero => {
                    const el = document.createElement('div');
                    el.innerHTML = renderHeroCard(hero);
                    el.dataset.hero = hero.name.toLowerCase();
                    el.dataset.types = (hero.changes || []).map(c => c.type).join(',');
                    roleSection.appendChild(el.firstElementChild);
                });
            }

            dom.content.appendChild(roleSection);
        });

        if (section.generalItems?.length > 0) {
            const generalSection = document.createElement('div');
            generalSection.className = `role-section ${state.currentRole === 'Todos' || state.currentRole === '__general__' ? 'active' : ''}`;
            generalSection.id = 'role-__general__';
            generalSection.innerHTML = `<h2 class="role-section-title">Objetos Generales y Mapas</h2>`;

            section.generalItems.forEach(item => {
                const el = document.createElement('div');
                el.innerHTML = renderHeroCard(item);
                el.dataset.hero = item.name.toLowerCase();
                generalSection.appendChild(el.firstElementChild);
            });

            dom.content.appendChild(generalSection);
        }

    } else {
        const flat = Array.isArray(section) ? section : [];
        if (flat.length === 0) {
            dom.content.appendChild(createEmptySection('Próximamente', 'Esta sección se completará con el scraper.'));
        } else {
            if (state.currentSection === 'bugFixes') {
                const card = document.createElement('div');
                card.className = 'hero-card';
                card.style.padding = '2rem';
                card.style.display = 'block';
                card.style.cursor = 'default';
                card.innerHTML = `
                    <h2 class="role-section-title" style="margin-top:0;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.75rem;border:none;padding:0">
                        <span style="font-size:1.5rem">🐛</span> Corrección de Errores
                    </h2>
                    <ul class="bug-fixes-list" style="margin:0;padding-left:1.25rem;list-style-type:disc;color:var(--text-light)">
                        ${flat.map(bug => `<li style="margin-bottom:0.75rem;line-height:1.6;font-size:0.95rem">${bug}</li>`).join('')}
                    </ul>
                `;
                dom.content.appendChild(card);
            } else {
                flat.forEach(item => {
                    const el = document.createElement('div');
                    el.innerHTML = renderHeroCard(item);
                    dom.content.appendChild(el.firstElementChild);
                });
            }
        }
    }
}

export function createEmptySection(title, desc) {
    const el = document.createElement('div');
    el.className = 'empty-section';
    el.innerHTML = `
        <div class="empty-section-icon">⏳</div>
        <div class="empty-section-title">${title}</div>
        <div class="empty-section-desc">${desc}</div>
    `;
    return el;
}

export function renderContentNotDownloaded(patchMeta) {
    const [year, month] = patchMeta.id.split('-');
    const autoUrl = `https://overwatch.blizzard.com/en-us/news/patch-notes/live/${year}/${month}`;

    const isStaticMode = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:';

    let actionHtml = '';
    if (isStaticMode) {
        actionHtml = `
            <div style="margin-top: 1.5rem; padding: 1.25rem; background: rgba(249, 115, 22, 0.05); border: 1px solid rgba(249, 115, 22, 0.2); border-radius: var(--radius-sm); max-width: 550px; margin-left: auto; margin-right: auto;">
                <p style="margin-bottom: 0; font-size: 0.9rem; color: var(--text-2); line-height: 1.6;">
                    Este parche aún no se encuentra disponible. Las actualizaciones se ejecutan de forma automática diariamente en el servidor, por lo que se publicará en las próximas horas.
                </p>
            </div>
        `;
    } else {
        actionHtml = `
            <div style="margin-top: 1rem; padding: 0 1rem;">
                <p style="margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.85rem; word-break: break-all;">
                    Se descargará y procesará automáticamente desde: <br>
                    <a href="${autoUrl}" target="_blank" style="color: var(--blue); word-break: break-all; text-decoration: underline;">${autoUrl}</a>
                </p>
                <div style="display: flex; justify-content: center; margin-top: 1.5rem;">
                    <button id="scrape-custom-btn" class="role-btn active" style="flex-shrink: 0; padding: 0.75rem 1.5rem; width: 100%; max-width: 280px; justify-content: center;">
                        <span class="role-dot" style="background:var(--blue)"></span>
                        📥 Descargar y procesar
                    </button>
                </div>
            </div>
        `;
    }

    dom.content.innerHTML = `
        <div class="patch-header-card">
            <div class="patch-version-badge">
                📥 No descargado localmente
            </div>
            <h1 class="patch-card-title">${patchMeta.title}</h1>
            <p class="patch-card-desc">Este parche aún no ha sido descargado en el almacenamiento local.</p>
        </div>
        
        <div class="empty-section">
            <div class="empty-section-icon">🌐</div>
            <div class="empty-section-title">Descargar Notas de Parche</div>
            <div class="empty-section-desc" style="max-width: 500px; margin: 0.5rem auto 1.5rem auto;">
                ${isStaticMode
            ? 'La visualización de este parche requiere que haya sido descargado previamente en el repositorio.'
            : 'Este parche se puede descargar automáticamente desde la URL oficial de Blizzard:'}
            </div>
            ${actionHtml}
        </div>
    `;

    const scrapeBtn = document.getElementById('scrape-custom-btn');

    if (scrapeBtn) {
        scrapeBtn.onclick = async () => {
            const urlVal = autoUrl;
            const queryParams = `?url=${encodeURIComponent(urlVal)}`;

            scrapeBtn.disabled = true;
            scrapeBtn.textContent = '⏳ Descargando...';
            if (dom.refreshBtn) dom.refreshBtn.classList.add('spinning');

            await startScrapeStream(queryParams, async () => {
                await init(true);
                // Buscar si hay algún parche descargado para este mes en state.allPatches
                const matchingPatches = state.allPatches.filter(p => p.id === patchMeta.id || p.id.startsWith(patchMeta.id + '-'));
                const targetPatch = matchingPatches.find(p => p.isDownloaded) || matchingPatches[0] || patchMeta;

                dom.patchSelect.value = targetPatch.id;
                await loadPatch(targetPatch.id);
            });

            scrapeBtn.disabled = false;
            scrapeBtn.textContent = '📥 Descargar y procesar';
            if (dom.refreshBtn) dom.refreshBtn.classList.remove('spinning');
        };
    }
}
