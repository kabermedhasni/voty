// Searchable Multi-Select Dropdown Utility
// Adds search functionality to multi-select dropdown menus

export function makeMultiSelectSearchable(container, options = {}) {
    const {
        searchPlaceholder = 'Search...',
        noResultsText = 'No results found',
        caseSensitive = false
    } = options;

    const menu = container.querySelector('.multi-select-menu');
    const button = container.querySelector('.multi-select-button');
    
    if (!menu || !button) {
        console.warn('[SearchableMultiSelect] Missing menu or button');
        return;
    }

    // Check if already searchable
    if (menu.querySelector('.multi-select-search')) {
        return;
    }

    // Create search input
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'multi-select-search';
    searchWrapper.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input type="text" class="multi-select-search-input" placeholder="${searchPlaceholder}">
    `;

    // Insert search at the top of menu
    menu.insertBefore(searchWrapper, menu.firstChild);

    const searchInput = searchWrapper.querySelector('.multi-select-search-input');
    const items = Array.from(menu.querySelectorAll('.multi-select-item'));

    // Prevent dropdown from closing when clicking search
    searchWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = caseSensitive ? e.target.value : e.target.value.toLowerCase();
        let visibleCount = 0;

        items.forEach(item => {
            const text = caseSensitive ? item.textContent : item.textContent.toLowerCase();
            const matches = text.includes(searchTerm);
            
            item.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        });

        // Show/hide no results message
        let noResultsMsg = menu.querySelector('.multi-select-no-results');
        if (visibleCount === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'multi-select-no-results';
                noResultsMsg.textContent = noResultsText;
                menu.appendChild(noResultsMsg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    });

    // Clear search when dropdown opens
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (menu.classList.contains('active')) {
                    searchInput.value = '';
                    items.forEach(item => item.style.display = '');
                    const noResultsMsg = menu.querySelector('.multi-select-no-results');
                    if (noResultsMsg) noResultsMsg.remove();
                    // Focus search input when dropdown opens
                    setTimeout(() => searchInput.focus(), 100);
                }
            }
        });
    });

    observer.observe(menu, { attributes: true });

    return {
        searchInput,
        clear: () => {
            searchInput.value = '';
            items.forEach(item => item.style.display = '');
            const noResultsMsg = menu.querySelector('.multi-select-no-results');
            if (noResultsMsg) noResultsMsg.remove();
        }
    };
}

// Initialize all multi-select dropdowns with data-searchable attribute
export function initSearchableMultiSelects(root = document) {
    const searchableMultiSelects = root.querySelectorAll('.multi-select-container[data-searchable]');
    
    searchableMultiSelects.forEach(multiSelect => {
        const placeholder = multiSelect.dataset.searchPlaceholder || 'Search...';
        const noResults = multiSelect.dataset.noResults || 'No results found';
        
        makeMultiSelectSearchable(multiSelect, {
            searchPlaceholder: placeholder,
            noResultsText: noResults
        });
    });
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initSearchableMultiSelects();
    });
} else {
    initSearchableMultiSelects();
}
