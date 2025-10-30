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
  const button = container.querySelector(".dropdown-button");
  const menu = container.querySelector(".dropdown-menu");
  if (!button || !menu) return;

  // Toggle open/close
  button.addEventListener("click", () => {
    button.classList.toggle("active");
    menu.classList.toggle("active");
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
  items.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = item.getAttribute("data-value") ?? item.getAttribute("data-lang") ?? item.textContent.trim();

      // Close this dropdown
      button.classList.remove("active");
      menu.classList.remove("active");

      // Notify listeners (bubble so pages can listen at document level)
      const ev = new CustomEvent("dropdown:select", {
        bubbles: true,
        detail: { container, button, menu, item, value },
      });
      container.dispatchEvent(ev);
      document.dispatchEvent(ev);
    });
  });
}

export function initDropdowns(root = document) {
  const containers = root.querySelectorAll(".dropdown-container");
  containers.forEach(initDropdown);
}

// Auto-init on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initDropdowns());
} else {
  initDropdowns();
}
