/**
 * app.js — Lógica principal de la aplicación de patch notes de OW2
 */

// ─── Hero Portraits ───────────────────────────────────────────────────────────
const HERO_PORTRAITS = {
    "ana": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/985b06beae46b7ba3ca87d1512d0fc62ca7f206ceca58ef16fc44d43a1cc84ed.png",
    "anran": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2c38b41d79a1ce9a08b9ad8eb7edf3ff819bd448af16a5815be8c7fdb7203aa0.png",
    "ashe": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4076bbaa2eb52a0bfe612434071e56e7702d5454473dbbea2f9e392a9d997a94.png",
    "baptiste": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d4e6f1ca45d9f88fa89260787397f141a6f007b14e5b26698883b6a17bab9680.png",
    "bastion": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4ede795c2a681aaccfa72d0c901cba0cb8a2c292fd6a97b2ba9faed161c2d184.png",
    "brigitte": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/795fba91376d87d441a7f359ae12a3175dfa95825ccc4414cc6b95b129fc4cb0.png",
    "cassidy": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9240cd64cc8ef58df9acbf55204ab1b5d8578f743fda5931f0dbccbd75ab841b.png",
    "domina": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1161c112292c56c052c0ae711792fcde06e3251b98bc9709e582dd7585b5dcd6.png",
    "doomfist": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ff5c54f43ad253c7faeda9c4ed31d42582ea6b19205d197866f3dd0c0aa14c16.png",
    "d.va": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/df5a5532862d9292634fb3dc0e51a4705aa601de65e5e815513ccc663d84de56.png",
    "dva": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/df5a5532862d9292634fb3dc0e51a4705aa601de65e5e815513ccc663d84de56.png",
    "echo": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d4f2d5b0c2b7e82d61353186c5f23152ccba9d3569b50839aa580dca3e9114ba.png",
    "emre": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c51e2f698138861c0e3b6cfab3c3ca9d67fd709be175e7c397aa6f2649712a30.png",
    "freja": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/811963897c352d9f178bec882d94bd0281074feee7c429c5145b6b8ea8ebe862.png",
    "genji": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/156b12c20b1aea872c1eeb5bb37a7de1047b2ab30ecefd0663a8925badde1ea8.png",
    "hanzo": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/78b61c3e806fb26b02b8980fba62189155074fc15bd865b0883268e546030be5.png",
    "hazard": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ca48b96dbae6ea7f58ce8a5e73513c8c62b1685bdbf258020fb78bb21a008b5f.png",
    "illari": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ce42d1455e03e79f321345fea84b27a8918b5db8bd7ab9b2ca9e569606ede9e4.png",
    "jetpack cat": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/03a184cd0de27091e0099ac22635ad9615a8f6997881a5c25cc5f2444764f729.png",
    "jetpack-cat": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/03a184cd0de27091e0099ac22635ad9615a8f6997881a5c25cc5f2444764f729.png",
    "junker queen": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/06eeecb359f311f43a8f5121d4f9f3a93c565d70b30e94ef543c05596c9a39dc.png",
    "junker-queen": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/06eeecb359f311f43a8f5121d4f9f3a93c565d70b30e94ef543c05596c9a39dc.png",
    "junkrat": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7660b9fc6f25f30858fdd8797fe0d52b2306f1e78fef99843f58a274e69af046.png",
    "juno": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c0167d251e57b0aa2b1e16c37d87f0e7c77263db9dd0503d77b5f2589bf3e4a0.png",
    "kiriko": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/408603fe037e8576078eaac5eab2fb251489ced4003b11f5f522776d43d0b83d.png",
    "lifeweaver": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3376515cebed0904012e67e956f6d1b9c12e03da642845eeaf787b7e4c7b339d.png",
    "lúcio": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/040bb13f5123ab93faad2f95627ba184608aef4b2469a4d3003859c7087df044.png",
    "lucio": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/040bb13f5123ab93faad2f95627ba184608aef4b2469a4d3003859c7087df044.png",
    "mauga": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/33d39bb439c08975197fc52eff4874716839711b5356c4fdc174f9c24bac1d0e.png",
    "mei": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4a55ced3bd597fb08e0fde9dc007f8543ac616ba98ca3db9b0e4d871a8ae17f8.png",
    "mercy": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3bfb8bd8ec827e53d870f1238ab73d8aa1f5dbfbcfaaf7f96ffcd35b5c6102ab.png",
    "mizuki": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a9733c2367e0cbd70b9316fd2e1e17028653ec56d0051ea6ff098531dc4f99fc.png",
    "moira": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f48f8485056d5d00dad195859188d23e50f7126b8b08b5646f46ef1b42f5e1de.png",
    "orisa": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a73958a28551f5254f3ab3f97c5f5f8d698a95c0b6a515d1a2b1caac169205a6.png",
    "pharah": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/60ac2d5de4a6d34644d8872233da402f1436c87f804bb11a21661bb30bf4a51f.png",
    "ramattra": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ddef7c9fb8ce4256e8508196b486f81950efe7aaa6cf27fec4668beb4cd15774.png",
    "reaper": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/dc6ff07ac790c00dc95a40882449617bb6e0e38906b353a630cffe0c815270a9.png",
    "reinhardt": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/551fbe070c16fdfcc17f7f1de63af22c53e7d2f1340fc2f3172441504527bc4e.png",
    "roadhog": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/89ddf07e4b619ed96169042e296a1b8856d102746f35add88284b44a9a5a6a03.png",
    "shion": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/070481cf871590a2b45a51d1335f9fe3d65eb4e4d361ecdd998b34fae2ed65d5.png",
    "sierra": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4bfd3d8b95844231115cb5bf4db03344c71bc3e865189c52403b2dc51438e63a.png",
    "sigma": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a4c032fa466c9a6d9c6974747635d7ef910027f91cd58892af0c899db565f92d.png",
    "sojourn": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/82b8c1b8765dcb9a0ba16e343c3516bf324c771ac81e9878473280216e70a889.png",
    "soldier: 76": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c93b5f0a528c40473188f77cc2a267aee7d5b6cf5c9e104105d634b4388674e2.png",
    "soldier-76": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c93b5f0a528c40473188f77cc2a267aee7d5b6cf5c9e104105d634b4388674e2.png",
    "sombra": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/47727b02a16e3bd7b2447d86ae1edf11587bc320b2aecb4f2f16a7ca4ad4e8a0.png",
    "symmetra": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ebec57e8bd68b3d4383edfeb34f8f52dd0b94a6467d594c2fee722e8a97c32aa.png",
    "torbjörn": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ce17118cedc29b0d2ac1e059666bed36b9531c85079b0b894bb402d12c917ba9.png",
    "torbjorn": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ce17118cedc29b0d2ac1e059666bed36b9531c85079b0b894bb402d12c917ba9.png",
    "tracer": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4504f6f15cb3feaa92ecd38e01dcf751cb5abdac2e0bb52d0555727e53277502.png",
    "vendetta": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/cf8ffb52b6f315546d5e94e9d6defad5a2c570798776956de23f47536f9529da.png",
    "venture": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/dcab9123f5f55df22e54d4e797de43c71b917e0149dd059a7fd6136f48464cd0.png",
    "widowmaker": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6e4702b45f196aaf51555cf57327322721f45458b17f5f0643ed008a88378259.png",
    "winston": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/46a10db3aa908c590ddc4e7606376a88143d1f1306ecfbea043263040f9529a5.png",
    "wrecking ball": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9ef1d58867136e0b26f928d896000b9dab216118f6e2f59e53f2e975e1e27afa.png",
    "wrecking-ball": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9ef1d58867136e0b26f928d896000b9dab216118f6e2f59e53f2e975e1e27afa.png",
    "wuyang": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4959500b495b35c0908be2abda56b53f2601b2c5cc39a1cfde8df1bffd38d66d.png",
    "zarya": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9b6f63cc66ddf9d5e0862173c733cc0d2e574c5c89357798d91b93b2f95a7080.png",
    "zenyatta": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7d1546b1541a8afc39353f9337a408d6275a141b0432b7e560ef61579996b0fc.png"
};

const FALLBACK_PORTRAIT = 'logo.svg';

// ─── Section Config ───────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'gameBase', label: 'Juego Base', icon: '🎮', hasRoles: true },
    { id: 'stadium', label: 'Stadium', icon: '🏟️', hasRoles: true },
    { id: 'bugFixes', label: 'Bug Fixes', icon: '🐛', hasRoles: false }
];

const ROLES = ['Tanque', 'Daño', 'Apoyo'];

const CHANGE_LABELS = {
    buff: 'Buff',
    nerf: 'Nerf',
    new: 'Nuevo',
    rework: 'Rework',
    adjust: 'Ajuste'
};

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
    patches: [],
    allPatches: [],
    currentPatch: null,
    currentSection: 'gameBase',
    currentRole: 'Todos',
    activeFilters: new Set(),
    searchQuery: '',
};

// ─── DOM Refs ─────────────────────────────────────────────────────────────────
const dom = {
    progressBar: document.getElementById('progress-bar'),
    loadingOverlay: document.getElementById('loading-overlay'),
    patchSelect: document.getElementById('patch-select'),
    refreshBtn: document.getElementById('refresh-btn'),
    searchInput: document.getElementById('search-input'),
    filterChips: document.querySelectorAll('.filter-chip[data-filter]'),
    sidebar: document.getElementById('sidebar'),
    content: document.getElementById('content'),
    patchHeaderCard: document.getElementById('patch-header-card'),
};

// ─── Utilities ────────────────────────────────────────────────────────────────
function getPortrait(name, portraitUrl) {
    if (portraitUrl) return portraitUrl;
    const key = name.toLowerCase().trim();
    return HERO_PORTRAITS[key] || FALLBACK_PORTRAIT;
}

function countByType(heroes, type) {
    if (!Array.isArray(heroes)) return 0;
    return heroes.reduce((acc, hero) => {
        return acc + (hero.changes || []).filter(c => c.type === type).length;
    }, 0);
}

function getAllHeroes(patchData) {
    if (!patchData || !patchData.sections) return [];
    const heroes = new Set();
    const addFromSection = (section) => {
        if (!section || !section.roles) return;
        Object.values(section.roles).forEach(roleHeroes => {
            if (Array.isArray(roleHeroes)) roleHeroes.forEach(h => heroes.add(h.name));
        });
    };
    addFromSection(patchData.sections.stadium);
    addFromSection(patchData.sections.gameBase);
    return heroes.size;
}

function countAllChanges(patchData) {
    if (!patchData || !patchData.sections) return 0;
    let count = 0;
    const countSection = (section) => {
        if (!section || !section.roles) return;
        Object.values(section.roles).forEach(heroes => {
            if (Array.isArray(heroes)) heroes.forEach(h => count += (h.changes || []).length);
        });
    };
    countSection(patchData.sections.stadium);
    countSection(patchData.sections.gameBase);
    return count;
}

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────
function initScrollProgress() {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        dom.progressBar.style.width = `${pct}%`;
    });
}

// ─── Data Loading ─────────────────────────────────────────────────────────────
async function loadPatchesIndex() {
    const resp = await fetch(`data/patches_index.json?t=${Date.now()}`);
    if (!resp.ok) throw new Error(`No se pudo cargar el índice de parches: ${resp.status}`);
    return resp.json();
}

async function loadPatchData(patchId) {
    const resp = await fetch(`data/patches/${patchId}/patch.json?t=${Date.now()}`);
    if (!resp.ok) throw new Error(`No se pudo cargar el parche ${patchId}: ${resp.status}`);
    return resp.json();
}

// ─── Rendering ────────────────────────────────────────────────────────────────

/** Renders the patch selector dropdown */
function renderPatchSelector(patches) {
    dom.patchSelect.innerHTML = patches.map(p => {
        const marker = p.isDownloaded !== false ? '' : ' 📥 (No descargado)';
        return `<option value="${p.id}" ${p.isLatest ? 'selected' : ''}>
            ${p.title}${p.isLatest ? ' ✦' : ''}${marker}
        </option>`;
    }).join('');
}

/** Renders the sidebar with section tabs and role buttons */
function renderSidebar(patchData) {
    dom.sidebar.innerHTML = '';

    const sectionGroup = document.createElement('div');
    sectionGroup.className = 'sidebar-group';
    sectionGroup.innerHTML = '<div class="sidebar-group-label">Sección</div>';

    SECTIONS.forEach(sec => {
        const secData = patchData?.sections?.[sec.id];
        const hasContent = secData && (
            (sec.hasRoles && secData.roles && Object.values(secData.roles).some(r => r.length > 0)) ||
            (!sec.hasRoles && Array.isArray(secData) && secData.length > 0)
        );

        const btn = document.createElement('button');
        btn.className = `section-tab ${state.currentSection === sec.id ? 'active' : ''}`;
        btn.dataset.section = sec.id;
        btn.innerHTML = `
            <span class="tab-icon">${sec.icon}</span>
            ${sec.label}
            ${!hasContent ? '<span style="margin-left:auto;font-size:0.65rem;opacity:0.5">Pronto</span>' : ''}
        `;
        btn.onclick = () => switchSection(sec.id);
        sectionGroup.appendChild(btn);
    });

    dom.sidebar.appendChild(sectionGroup);

    // Roles sub-group (solo para secciones con roles)
    const currentSec = SECTIONS.find(s => s.id === state.currentSection);
    if (currentSec?.hasRoles) {
        const divider = document.createElement('div');
        divider.className = 'sidebar-divider';
        dom.sidebar.appendChild(divider);

        const roleGroup = document.createElement('div');
        roleGroup.className = 'sidebar-group';
        roleGroup.innerHTML = '<div class="sidebar-group-label">Rol</div>';

        const sectionData = patchData?.sections?.[state.currentSection];

        // Calcular héroes totales para "Todos"
        let totalHeroes = 0;
        ROLES.forEach(r => {
            totalHeroes += (sectionData?.roles?.[r] || []).length;
        });
        if (state.currentSection === 'stadium' && sectionData?.generalItems?.length > 0) {
            totalHeroes += sectionData.generalItems.length;
        }

        // Botón TODOS
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

        // Items generales (Stadium)
        if (state.currentSection === 'stadium' && sectionData?.generalItems?.length > 0) {
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

/** Renders the patch header card */
function renderPatchHeader(patchData, patchMeta) {
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

/** Renders a change item */
function renderChangeItem(change) {
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

/** Renders a hero card */
function renderHeroCard(hero, isOpen = false) {
    const portrait = getPortrait(hero.name, hero.portrait);

    // Contar por tipo para los mini-badges
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
                     onerror="this.onerror=null; this.src='${FALLBACK_PORTRAIT}'">
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

/** Renders the main content area based on current state */
function renderContent(patchData) {
    dom.content.innerHTML = '';

    // Patch header always at top
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
        // Show role sections
        ROLES.forEach(role => {
            const heroes = section.roles?.[role] || [];

            // Si estamos en modo Todos y no hay héroes, no renderizamos la sección para mantener limpio el diseño
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

        // General items (Stadium only)
        if (state.currentSection === 'stadium' && section.generalItems?.length > 0) {
            const generalSection = document.createElement('div');
            generalSection.className = `role-section ${state.currentRole === 'Todos' || state.currentRole === '__general__' ? 'active' : ''}`;
            generalSection.id = 'role-__general__';
            generalSection.innerHTML = `<h2 class="role-section-title">Objetos Generales & Mapas</h2>`;

            section.generalItems.forEach(item => {
                const el = document.createElement('div');
                el.innerHTML = renderHeroCard(item);
                el.dataset.hero = item.name.toLowerCase();
                generalSection.appendChild(el.firstElementChild);
            });

            dom.content.appendChild(generalSection);
        }

    } else {
        // Flat sections (bugs, maps, system)
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

function createEmptySection(title, desc) {
    const el = document.createElement('div');
    el.className = 'empty-section';
    el.innerHTML = `
        <div class="empty-section-icon">⏳</div>
        <div class="empty-section-title">${title}</div>
        <div class="empty-section-desc">${desc}</div>
    `;
    return el;
}

function renderContentNotDownloaded(patchMeta) {
    const [year, month] = patchMeta.id.split('-');
    const autoUrl = `https://overwatch.blizzard.com/en-us/news/patch-notes/live/${year}/${month}`;

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
                Este parche se puede descargar automáticamente desde la URL oficial de Blizzard:
            </div>
            <div style="margin-top: 1rem;">
                <p style="margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.85rem;">
                    Se descargará y procesará automáticamente desde: <br>
                    <a href="${autoUrl}" target="_blank" style="color: var(--accent-blue);">${autoUrl}</a>
                </p>
                <div style="display: flex; justify-content: center; margin-top: 1.5rem;">
                    <button id="scrape-custom-btn" class="role-btn active" style="flex-shrink: 0; padding: 0.75rem 1.5rem;">
                        <span class="role-dot" style="background:var(--accent-blue)"></span>
                        📥 Descargar y procesar
                    </button>
                </div>
            </div>
        </div>
    `;

    const scrapeBtn = document.getElementById('scrape-custom-btn');

    if (scrapeBtn) {
        scrapeBtn.onclick = async () => {
            const urlVal = autoUrl;

            scrapeBtn.disabled = true;
            scrapeBtn.textContent = '⏳ Descargando...';
            if (dom.refreshBtn) dom.refreshBtn.classList.add('spinning');

            try {
                const response = await fetch(`/api/scrape?url=${encodeURIComponent(urlVal)}`);
                const data = await response.json();

                if (data.success) {
                    alert('¡Parche descargado con éxito!');
                    await init(true); // Recargar index sin cambiar a la última versión por defecto
                    dom.patchSelect.value = patchMeta.id; // Ajustar selector al parche descargado
                    await loadPatch(patchMeta.id); // Mostrar datos del parche descargado
                } else {
                    alert(`Error al descargar el parche: ${data.error}`);
                }
            } catch (err) {
                console.error(err);
                alert(`Error de red al conectar con el servidor: ${err.message}`);
            } finally {
                scrapeBtn.disabled = false;
                scrapeBtn.textContent = '📥 Descargar y procesar';
                if (dom.refreshBtn) dom.refreshBtn.classList.remove('spinning');
            }
        };
    }
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function switchSection(sectionId) {
    state.currentSection = sectionId;
    state.currentRole = 'Todos'; // reset role
    renderSidebar(state.currentPatch);
    renderContent(state.currentPatch);

    // Re-attach patch meta since renderContent replaces the header
    const patchMeta = state.patches.find(p => p.id === dom.patchSelect.value);
    renderPatchHeader(state.currentPatch, patchMeta);

    applyFiltersAndSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchRole(role) {
    state.currentRole = role;

    // Update active role section
    document.querySelectorAll('.role-section').forEach(sec => {
        sec.classList.toggle('active', role === 'Todos' || sec.id === `role-${role}`);
    });

    // Update sidebar buttons
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.role === role);
    });

    applyFiltersAndSearch();
}

// ─── Filters & Search ─────────────────────────────────────────────────────────

function applyFiltersAndSearch() {
    const query = state.searchQuery.toLowerCase().trim();
    const filters = state.activeFilters;

    const activeSections = document.querySelectorAll('.role-section.active');
    if (activeSections.length === 0) return;

    let overallVisibleCount = 0;

    activeSections.forEach(activeSection => {
        const heroCards = activeSection.querySelectorAll('.hero-card');
        let visibleCount = 0;

        heroCards.forEach(card => {
            const heroName = card.querySelector('.hero-name')?.textContent?.toLowerCase() || '';
            const matchesSearch = !query || heroName.includes(query);

            let matchesFilter = true;
            if (filters.size > 0) {
                const changeItems = card.querySelectorAll('.change-item');
                const hasMatchingChange = Array.from(changeItems).some(item => {
                    return Array.from(filters).some(f => item.classList.contains(f));
                });
                matchesFilter = hasMatchingChange;

                // Filter individual change items
                changeItems.forEach(item => {
                    const typeMatch = Array.from(filters).some(f => item.classList.contains(f));
                    item.style.display = typeMatch ? '' : 'none';
                });
            } else {
                // Reset all change items visibility
                card.querySelectorAll('.change-item').forEach(item => item.style.display = '');
            }

            const visible = matchesSearch && matchesFilter;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount++;
                overallVisibleCount++;
            }
        });

        // Ocultar sección entera en modo "Todos" si no hay héroes que coincidan
        if (state.currentRole === 'Todos') {
            if (visibleCount === 0) {
                activeSection.style.display = 'none';
            } else {
                activeSection.style.display = 'flex';
            }
        } else {
            activeSection.style.display = 'flex';
        }

        // Show/hide no-results
        let noResults = activeSection.querySelector('.no-results');
        if (state.currentRole !== 'Todos' && visibleCount === 0 && (query || filters.size > 0)) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.className = 'no-results';
                activeSection.appendChild(noResults);
            }
            noResults.textContent = `No se encontraron resultados para "${query || [...filters].join(', ')}"`;
        } else if (noResults) {
            noResults.remove();
        }
    });

    // En modo "Todos", si el total de héroes visibles en todas las secciones es 0, mostrar no resultados global
    let globalNoResults = dom.content.querySelector('.global-no-results');
    if (state.currentRole === 'Todos' && overallVisibleCount === 0 && (query || filters.size > 0)) {
        if (!globalNoResults) {
            globalNoResults = document.createElement('div');
            globalNoResults.className = 'no-results global-no-results';
            globalNoResults.style.gridColumn = '1 / -1';
            globalNoResults.style.textAlign = 'center';
            globalNoResults.style.padding = '3rem 2rem';
            dom.content.appendChild(globalNoResults);
        }
        globalNoResults.textContent = `No se encontraron resultados para "${query || [...filters].join(', ')}" en ningún rol.`;
    } else if (globalNoResults) {
        globalNoResults.remove();
    }
}

function toggleFilter(filterType) {
    if (state.activeFilters.has(filterType)) {
        state.activeFilters.delete(filterType);
    } else {
        state.activeFilters.add(filterType);
    }

    dom.filterChips.forEach(chip => {
        chip.classList.toggle('active', state.activeFilters.has(chip.dataset.filter));
    });

    applyFiltersAndSearch();
}

// ─── Patch Loading ────────────────────────────────────────────────────────────

async function loadPatch(patchId) {
    const patchMeta = state.allPatches.find(p => p.id === patchId);

    if (patchMeta && patchMeta.isDownloaded === false) {
        state.currentPatch = patchMeta;
        renderSidebar(null);
        renderContentNotDownloaded(patchMeta);
        return;
    }

    // Show skeleton
    dom.content.innerHTML = `
        <div class="patch-header-card" style="min-height:120px">
            <div class="skeleton-line" style="width:20%;height:16px;margin-bottom:1rem"></div>
            <div class="skeleton-line" style="width:50%;height:28px;margin-bottom:0.5rem"></div>
            <div class="skeleton-line" style="width:70%"></div>
        </div>
        ${[1, 2, 3, 4, 5].map(() => `
            <div class="skeleton-card">
                <div class="skeleton-circle"></div>
                <div class="skeleton-lines">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                </div>
            </div>
        `).join('')}
    `;

    const patchData = await loadPatchData(patchId);
    state.currentPatch = patchData;

    renderSidebar(patchData);
    renderContent(patchData);

    renderPatchHeader(patchData, patchMeta);
}

// ─── Format Helpers ───────────────────────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const [year, month, day] = dateStr.split('-');
    return `${day ? day + ' de ' : ''}${months[parseInt(month) - 1]} ${year}`;
}

function generateAllMonths() {
    const startYear = 2022;
    const startMonth = 10; // Octubre 2022

    const now = new Date();
    let endYear = now.getFullYear();
    let endMonth = now.getMonth() + 1;

    // Asegurar que abarcamos cualquier parche futuro descargado
    if (state.patches && state.patches.length > 0) {
        state.patches.forEach(p => {
            if (p.id) {
                const [y, m] = p.id.split('-');
                const py = parseInt(y, 10);
                const pm = parseInt(m, 10);
                if (py > endYear || (py === endYear && pm > endMonth)) {
                    endYear = py;
                    endMonth = pm;
                }
            }
        });
    }

    const monthsList = [];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    let year = endYear;
    let month = endMonth;

    while (year > startYear || (year === startYear && month >= startMonth)) {
        const id = `${year}-${String(month).padStart(2, '0')}`;
        monthsList.push({
            id,
            title: `Actualización de ${monthNames[month - 1]} ${year}`,
            year,
            month
        });

        month--;
        if (month === 0) {
            month = 12;
            year--;
        }
    }

    return monthsList;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init(skipLoadingPatch = false) {
    if (skipLoadingPatch instanceof Event) {
        skipLoadingPatch = false;
    }
    initScrollProgress();

    try {
        // Load patches index
        const indexData = await loadPatchesIndex();
        state.patches = indexData.patches || [];

        // Generar la lista de todos los meses de retrocompatibilidad
        const generatedMonths = generateAllMonths();

        // Construir allPatches a partir de los parches descargados
        const allPatches = [];
        
        // Agregar los descargados
        state.patches.forEach(p => {
            allPatches.push({ ...p, isDownloaded: true });
        });

        // Para cada mes generado, si no hay ningún parche descargado en ese mes, agregar el placeholder no descargado
        generatedMonths.forEach(gen => {
            const hasDownloadedInMonth = state.patches.some(p => p.id.startsWith(gen.id));
            if (!hasDownloadedInMonth) {
                allPatches.push({ ...gen, isDownloaded: false });
            }
        });

        // Ordenar todos los parches por fecha descendente
        allPatches.sort((a, b) => {
            const dateA = a.date || a.id + '-01';
            const dateB = b.date || b.id + '-01';
            return dateB.localeCompare(dateA);
        });

        state.allPatches = allPatches;

        renderPatchSelector(state.allPatches);

        if (skipLoadingPatch) {
            dom.loadingOverlay.classList.add('hidden');
            setTimeout(() => dom.loadingOverlay.style.display = 'none', 500);
            return;
        }

        // Buscar el último parche disponible descargado como predeterminado
        let defaultPatch = state.allPatches.find(p => p.isLatest && p.isDownloaded);
        if (!defaultPatch) {
            defaultPatch = state.allPatches.find(p => p.isDownloaded) || state.allPatches[0];
        }

        if (!defaultPatch) throw new Error('No hay parches disponibles');

        dom.patchSelect.value = defaultPatch.id;
        await loadPatch(defaultPatch.id);

        // Hide loading overlay
        dom.loadingOverlay.classList.add('hidden');
        setTimeout(() => dom.loadingOverlay.style.display = 'none', 500);

    } catch (err) {
        console.error('Error al inicializar:', err);
        dom.loadingOverlay.innerHTML = `
            <div style="text-align:center;color:#f87171">
                <div style="font-size:3rem;margin-bottom:1rem">⚠️</div>
                <div style="font-size:1.1rem;font-weight:600;margin-bottom:0.5rem">Error al cargar</div>
                <div style="font-size:0.875rem;color:#94a3b8">${err.message}</div>
                <div style="font-size:0.8rem;color:#64748b;margin-top:0.5rem">Asegúrate de servir desde un servidor local (no abrir index.html directamente)</div>
            </div>
        `;
    }

    // Patch selector
    dom.patchSelect.addEventListener('change', () => {
        loadPatch(dom.patchSelect.value);
    });

    // Refresh button click handler
    if (dom.refreshBtn) {
        dom.refreshBtn.addEventListener('click', async () => {
            if (dom.refreshBtn.classList.contains('spinning')) return;

            dom.refreshBtn.classList.add('spinning');
            console.log('[App] Refrescando parche completo por mes/URL...');

            let queryParams = '?force=true';
            if (state.currentPatch && state.currentPatch.url) {
                queryParams += '&url=' + encodeURIComponent(state.currentPatch.url);
            }

            try {
                const response = await fetch(`/api/scrape${queryParams}`);
                const data = await response.json();
                if (data.success) {
                    console.log('[App] Raspado exitoso. Recargando datos en la interfaz...');
                    if (data.stdout) console.log(data.stdout);
                    
                    // Recargar el index y luego volver a cargar el parche actual
                    const currentPatchId = state.currentPatch?.date || dom.patchSelect.value;
                    await init(true); // Recargar index sin reiniciar la UI al primer parche
                    dom.patchSelect.value = currentPatchId;
                    await loadPatch(currentPatchId);
                } else {
                    alert(`Error al refrescar los datos: ${data.error || 'Desconocido'}`);
                }
            } catch (err) {
                console.error('[App] Error de red al solicitar el raspado:', err);
                alert(`Error de red al conectar con el servidor: ${err.message}`);
            } finally {
                dom.refreshBtn.classList.remove('spinning');
            }
        });
    }

    // Search
    dom.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        applyFiltersAndSearch();
    });

    // Filters
    dom.filterChips.forEach(chip => {
        chip.addEventListener('click', () => toggleFilter(chip.dataset.filter));
    });
}

// Start
document.addEventListener('DOMContentLoaded', () => init());
