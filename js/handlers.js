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
    const filters = state.activeFilters;

    const sections = document.querySelectorAll('.role-section');
    if (sections.length === 0) return;

    let overallVisibleCount = 0;

    sections.forEach(section => {
        const isActive = section.classList.contains('active');
        if (!isActive) {
            section.style.display = 'none';
            return;
        }

        const heroCards = section.querySelectorAll('.hero-card');
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
                section.style.display = 'none';
            } else {
                section.style.display = 'flex';
            }
        } else {
            section.style.display = 'flex';
        }

        // Show/hide no-results
        let noResults = section.querySelector('.no-results');
        if (state.currentRole !== 'Todos' && visibleCount === 0 && (query || filters.size > 0)) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.className = 'no-results';
                section.appendChild(noResults);
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
