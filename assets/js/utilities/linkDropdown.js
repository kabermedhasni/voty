// Link Dropdown Utility
// For navigation dropdowns that contain links, not selection options
// Usage: Add classes 'link-dropdown-container', 'link-dropdown-trigger', and 'link-dropdown-menu'

function initLinkDropdown(container) {
    const trigger = container.querySelector('.link-dropdown-trigger');
    const menu = container.querySelector('.link-dropdown-menu');

    if (!trigger || !menu) return;

    function openDropdown() {
        menu.classList.add('active');
        trigger.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
    }

    function closeDropdown() {
        menu.classList.remove('active');
        trigger.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
    }

    // Toggle dropdown on trigger click
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = menu.classList.contains('active');

        if (isActive) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            closeDropdown();
        }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            closeDropdown();
            trigger.focus();
        }
    });

    // Handle links with loading states (e.g., logout buttons)
    const loadingLinks = menu.querySelectorAll('[data-loading="true"]');
    loadingLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            link.classList.add('btn-loading');

            // Navigate after showing spinner
            setTimeout(() => {
                window.location.href = link.getAttribute('href');
            }, 100);
        });
    });
}

// Initialize all link dropdowns
function initLinkDropdowns(root = document) {
    const containers = root.querySelectorAll('.link-dropdown-container');
    containers.forEach(initLinkDropdown);
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initLinkDropdowns());
} else {
    initLinkDropdowns();
}

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initLinkDropdowns, initLinkDropdown };
}
