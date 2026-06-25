import { HERO_PORTRAITS, FALLBACK_PORTRAIT } from './config.js';
import { state } from './state.js';

export function getPortrait(name, portraitUrl) {
    if (portraitUrl) return portraitUrl;
    const key = name.toLowerCase().trim();
    return HERO_PORTRAITS[key] || FALLBACK_PORTRAIT;
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
    countSection(patchData.sections.stadium);
    countSection(patchData.sections.gameBase);
    return count;
}

export function generateAllMonths() {
    const startYear = 2026;
    const startMonth = 5; // Mayo 2026

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
