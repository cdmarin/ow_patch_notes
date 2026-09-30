export const state = {
    patches: [],
    allPatches: [],
    currentPatch: null,
    currentSection: 'gameBase',
    currentRole: 'Todos',
    activeFilters: new Set(),
    searchQuery: '',
    language: 'es',          // 'es' = traducción, 'en' = texto original de Blizzard
    translatedPatch: null,   // Datos traducidos del parche actual
    originalPatch: null,     // Datos originales en inglés (null = sin cargar, false = no disponible)
};
