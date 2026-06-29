let _patchHeaderCard = null;

export const dom = {
    get progressBar() { return document.getElementById('progress-bar'); },
    get loadingOverlay() { return document.getElementById('loading-overlay'); },
    get patchSelect() { return document.getElementById('patch-select'); },
    get refreshBtn() { return document.getElementById('refresh-btn'); },
    get updateBtn() { return document.getElementById('update-btn'); },
    get searchInput() { return document.getElementById('search-input'); },
    get filterChips() { return document.querySelectorAll('.filter-chip[data-filter]'); },
    get sidebar() { return document.getElementById('sidebar'); },
    get content() { return document.getElementById('content'); },
    get themeToggleBtn() { return document.getElementById('theme-toggle-btn'); },
    get mobileFilterToggleBtn() { return document.getElementById('mobile-filter-toggle-btn'); },
    get closeDrawerBtn() { return document.getElementById('close-drawer-btn'); },
    get drawerOverlay() { return document.getElementById('drawer-overlay'); },
    get filterWrap() { return document.querySelector('.filter-wrap'); },
    
    get patchHeaderCard() {
        return _patchHeaderCard || document.getElementById('patch-header-card');
    },
    set patchHeaderCard(val) {
        _patchHeaderCard = val;
    }
};
