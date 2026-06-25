/**
 * app.js — entrypoint principal de módulos de la aplicación
 */

import { state } from './js/state.js';
import { dom } from './js/dom.js';
import { SECTIONS } from './js/config.js';
import { generateAllMonths } from './js/utils.js';
import { startScrapeStream } from './js/stream.js';
import { 
    renderPatchSelector, 
    renderSidebar, 
    renderPatchHeader, 
    renderContent, 
    renderContentNotDownloaded 
} from './js/render.js';
import { 
    toggleFilter, 
    applyFiltersAndSearch 
} from './js/handlers.js';

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────
function initScrollProgress() {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        dom.progressBar.style.width = `${pct}%`;
    });
}

// ─── Theme Management ─────────────────────────────────────────────────────────
export function updateThemeUI(isLight) {
    if (isLight) {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

    // Toggle button icon
    const iconSpan = dom.themeToggleBtn ? dom.themeToggleBtn.querySelector('.theme-icon') : null;
    if (iconSpan) {
        iconSpan.textContent = isLight ? '🌙' : '☀️';
    }

    // Swap logos (excluding header logo which stays as orange/white logo.svg for contrast on blue bg)
    const logos = Array.from(document.querySelectorAll('img')).filter(img => 
        (img.classList.contains('loader-logo') ||
        img.classList.contains('scrape-logo') ||
        img.src.endsWith('logo.svg') ||
        img.src.endsWith('logo-light.svg')) &&
        !img.classList.contains('header-logo')
    );
    logos.forEach(logo => {
        logo.src = isLight ? 'logo-light.svg' : 'logo.svg';
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

// ─── Patch Loading ────────────────────────────────────────────────────────────
export async function loadPatch(patchId) {
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

    // Seleccionar por defecto la primera sección que tenga contenido
    const defaultSection = SECTIONS.find(sec => {
        const secData = patchData?.sections?.[sec.id];
        return secData && (
            (sec.hasRoles && secData.roles && Object.values(secData.roles).some(r => r.length > 0)) ||
            (sec.hasRoles && Array.isArray(secData.generalItems) && secData.generalItems.length > 0) ||
            (!sec.hasRoles && Array.isArray(secData) && secData.length > 0)
        );
    });
    state.currentSection = defaultSection ? defaultSection.id : 'gameBase';
    state.currentRole = 'Todos'; // restablecer rol por defecto

    renderSidebar(patchData);
    renderContent(patchData);
    renderPatchHeader(patchData, patchMeta);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
export async function init(skipLoadingPatch = false) {
    if (skipLoadingPatch instanceof Event) {
        skipLoadingPatch = false;
    }
    
    // Apply saved theme state
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (e) {
        console.warn('localStorage no está disponible:', e);
    }
    updateThemeUI(savedTheme === 'light');

    initScrollProgress();

    const isStaticMode = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:';
    if (isStaticMode) {
        if (dom.refreshBtn) dom.refreshBtn.style.display = 'none';
        if (dom.updateBtn) dom.updateBtn.style.display = 'none';
    }

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
}

// ─── Setup Event Listeners ────────────────────────────────────────────────────
function setupListeners() {
    // Theme toggle button
    if (dom.themeToggleBtn) {
        dom.themeToggleBtn.addEventListener('click', () => {
            const isLight = !document.body.classList.contains('light-theme');
            try {
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
            } catch (e) {
                console.warn('localStorage no está disponible:', e);
            }
            updateThemeUI(isLight);
        });
    } else {
        console.error('[Theme] Toggle button NOT found in dom!');
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
            } else if (state.currentPatch && state.currentPatch.id && state.currentPatch.id.length === 7) {
                const [year, month] = state.currentPatch.id.split('-');
                const autoUrl = `https://overwatch.blizzard.com/en-us/news/patch-notes/live/${year}/${month}`;
                queryParams += '&url=' + encodeURIComponent(autoUrl);
            }

            await startScrapeStream(queryParams, async () => {
                console.log('[App] Raspado exitoso. Recargando datos en la interfaz...');
                const currentPatchId = state.currentPatch?.date || state.currentPatch?.id || dom.patchSelect.value;
                await init(true); // Recargar index sin reiniciar la UI al primer parche
                
                // Buscar si hay algún parche descargado para este mes/ID en state.allPatches
                const matchingPatches = state.allPatches.filter(p => p.id === currentPatchId || (currentPatchId && currentPatchId.length === 7 && p.id.startsWith(currentPatchId + '-')));
                const targetPatch = matchingPatches.find(p => p.isDownloaded) || matchingPatches[0] || { id: currentPatchId };

                dom.patchSelect.value = targetPatch.id;
                await loadPatch(targetPatch.id);
            });

            dom.refreshBtn.classList.remove('spinning');
        });
    }

    // Update button click handler (solo buscar lo nuevo)
    if (dom.updateBtn) {
        dom.updateBtn.addEventListener('click', async () => {
            if (dom.updateBtn.classList.contains('spinning')) return;

            dom.updateBtn.classList.add('spinning');
            console.log('[App] Buscando nuevas notas de parche (sin forzar)...');

            const queryParams = ''; // Vacío para no forzar y buscar solo parches no descargados en la web principal

            await startScrapeStream(queryParams, async () => {
                console.log('[App] Búsqueda de actualizaciones completada. Recargando datos...');
                const previousPatchId = state.currentPatch?.id || dom.patchSelect.value;
                await init(true); // Recargar index
                
                // Intentar mantener seleccionado el mismo parche si todavía existe
                if (previousPatchId) {
                    const exists = state.allPatches.some(p => p.id === previousPatchId && p.isDownloaded);
                    if (exists) {
                        dom.patchSelect.value = previousPatchId;
                        await loadPatch(previousPatchId);
                    } else {
                        // Si no, cargar el último parche disponible
                        let defaultPatch = state.allPatches.find(p => p.isLatest && p.isDownloaded);
                        if (!defaultPatch) {
                            defaultPatch = state.allPatches.find(p => p.isDownloaded) || state.allPatches[0];
                        }
                        if (defaultPatch) {
                            dom.patchSelect.value = defaultPatch.id;
                            await loadPatch(defaultPatch.id);
                        }
                    }
                }
            });

            dom.updateBtn.classList.remove('spinning');
        });
    }

    // Search input
    dom.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        applyFiltersAndSearch();
    });

    // Filter chips
    dom.filterChips.forEach(chip => {
        chip.addEventListener('click', () => toggleFilter(chip.dataset.filter));
    });
}

// Start
async function bootstrap() {
    try {
        await init();
    } catch (err) {
        console.error('Error durante la inicialización:', err);
    }
    setupListeners();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
