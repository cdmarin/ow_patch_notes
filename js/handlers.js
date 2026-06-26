import { state } from './state.js';
import { dom } from './dom.js';
import { renderSidebar, renderContent, renderPatchHeader } from './render.js';

export function switchSection(sectionId) {
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

export function switchRole(role) {
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

export function applyFiltersAndSearch() {
    const query = state.searchQuery.toLowerCase().trim();
    const filters = Array.from(state.activeFilters);

    const sections = dom.content.getElementsByClassName('role-section');
    if (sections.length === 0) return;

    let overallVisibleCount = 0;

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const isActive = section.classList.contains('active');
        if (!isActive) {
            section.style.display = 'none';
            continue;
        }

        const heroCards = section.getElementsByClassName('hero-card');
        let visibleCount = 0;

        for (let j = 0; j < heroCards.length; j++) {
            const card = heroCards[j];
            const heroName = card.dataset.hero || '';
            const matchesSearch = !query || heroName.includes(query);

            let matchesFilter = true;
            if (filters.length > 0) {
                const cardTypes = card.dataset.types ? card.dataset.types.split(',') : [];
                const hasMatchingType = cardTypes.some(type => filters.includes(type));
                
                if (!hasMatchingType) {
                    matchesFilter = false;
                } else {
                    const changeItems = card.getElementsByClassName('change-item');
                    for (let k = 0; k < changeItems.length; k++) {
                        const item = changeItems[k];
                        let typeMatch = false;
                        for (let f = 0; f < filters.length; f++) {
                            if (item.classList.contains(filters[f])) {
                                typeMatch = true;
                                break;
                            }
                        }
                        item.style.display = typeMatch ? '' : 'none';
                    }
                }
            } else {
                const changeItems = card.getElementsByClassName('change-item');
                for (let k = 0; k < changeItems.length; k++) {
                    changeItems[k].style.display = '';
                }
            }

            const visible = matchesSearch && matchesFilter;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount++;
                overallVisibleCount++;
            }
        }

        if (state.currentRole === 'Todos') {
            section.style.display = visibleCount === 0 ? 'none' : 'flex';
        } else {
            section.style.display = 'flex';
        }

        let noResults = section.getElementsByClassName('no-results')[0];
        if (state.currentRole !== 'Todos' && visibleCount === 0 && (query || filters.length > 0)) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.className = 'no-results';
                section.appendChild(noResults);
            }
            noResults.textContent = `No se encontraron resultados para "${query || filters.join(', ')}"`;
        } else if (noResults) {
            noResults.remove();
        }
    }

    let globalNoResults = dom.content.getElementsByClassName('global-no-results')[0];
    if (state.currentRole === 'Todos' && overallVisibleCount === 0 && (query || filters.length > 0)) {
        if (!globalNoResults) {
            globalNoResults = document.createElement('div');
            globalNoResults.className = 'no-results global-no-results';
            globalNoResults.style.gridColumn = '1 / -1';
            globalNoResults.style.textAlign = 'center';
            globalNoResults.style.padding = '3rem 2rem';
            dom.content.appendChild(globalNoResults);
        }
        globalNoResults.textContent = `No se encontraron resultados para "${query || filters.join(', ')}" en ningún rol.`;
    } else if (globalNoResults) {
        globalNoResults.remove();
    }
}

export function toggleFilter(filterType) {
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
