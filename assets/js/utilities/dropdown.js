// Generic Dropdown Functionality
// This module initializes any dropdown with the following structure:
// .dropdown-container
//   .dropdown-button
//   .dropdown-menu
//     .dropdown-item[data-value?]
//
// It dispatches a `dropdown:select` CustomEvent with detail { container, button, menu, item, value }.
// For backward compatibility, if a dropdown item has data-lang, it will be used as `value` when data-value is missing.

function initDropdown(container) {
  console.log('[Dropdown] Initializing dropdown:', container.id || 'unnamed');
  const button = container.querySelector(".dropdown-button");
  const menu = container.querySelector(".dropdown-menu");
  if (!button || !menu) {
    console.warn('[Dropdown] Missing button or menu in container:', container.id || 'unnamed');
    return;
  }
  console.log('[Dropdown] Found button and menu for:', container.id || 'unnamed');

  // Toggle open/close
  button.addEventListener("click", () => {
    console.log('[Dropdown] Button clicked, toggling menu for:', container.id || 'unnamed');
    button.classList.toggle("active");
    menu.classList.toggle("active");
    console.log('[Dropdown] Menu active state:', menu.classList.contains('active'));
  });

  // Close when clicking outside this container
  document.addEventListener("click", (event) => {
    if (!container.contains(event.target)) {
      button.classList.remove("active");
      menu.classList.remove("active");
    }
  });

  // Item selection
  const items = container.querySelectorAll(".dropdown-item");
  console.log('[Dropdown] Found', items.length, 'items in:', container.id || 'unnamed');
  items.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = item.getAttribute("data-value") ?? item.getAttribute("data-lang") ?? item.textContent.trim();
      console.log('[Dropdown] Item clicked:', { index, value, container: container.id || 'unnamed' });

      // Close this dropdown
      button.classList.remove("active");
      menu.classList.remove("active");

      // Notify listeners (bubble so pages can listen at document level)
      const ev = new CustomEvent("dropdown:select", {
        bubbles: true,
        detail: { container, button, menu, item, value },
      });
      console.log('[Dropdown] Dispatching dropdown:select event with value:', value);
      container.dispatchEvent(ev);
      document.dispatchEvent(ev);
    });
  });
}

export function initDropdowns(root = document) {
  const containers = root.querySelectorAll(".dropdown-container");
  console.log('[Dropdown] Initializing', containers.length, 'dropdown containers');
  containers.forEach(initDropdown);
}

// Auto-init on DOM ready
if (document.readyState === "loading") {
  console.log('[Dropdown] Waiting for DOMContentLoaded...');
  document.addEventListener("DOMContentLoaded", () => {
    console.log('[Dropdown] DOMContentLoaded fired, initializing dropdowns');
    initDropdowns();
  });
} else {
  console.log('[Dropdown] DOM already loaded, initializing dropdowns immediately');
  initDropdowns();
}
