// Multi-Select Dropdown Functionality
// This module initializes any multi-select dropdown with the following structure:
// .multi-select-container
//   .multi-select-button
//     .multi-select-display
//   .multi-select-menu
//     .multi-select-item[data-value]
//
// Selected items are stored in a hidden input and displayed as tags in the button

function initMultiSelectDropdown(container) {
  const button = container.querySelector(".multi-select-button");
  const menu = container.querySelector(".multi-select-menu");
  const display = container.querySelector(".multi-select-display");
  const hiddenInput = container.querySelector("input[type='hidden']");
  
  if (!button || !menu || !display || !hiddenInput) return;

  // Check if already initialized to prevent double initialization
  if (container.dataset.multiSelectInitialized === 'true') return;
  container.dataset.multiSelectInitialized = 'true';

  // Store selected values as a Set for better performance
  let selectedValues = new Set();
  const placeholderText = display.getAttribute("data-placeholder") || "Select options...";

  // Toggle open/close
  const toggleHandler = (e) => {
    // Don't toggle if clicking on a tag close button
    if (e.target.closest('.multi-select-tag-close')) return;
    
    button.classList.toggle("active");
    menu.classList.toggle("active");
  };
  button.addEventListener("click", toggleHandler);

  // Close when clicking outside this container
  const outsideClickHandler = (event) => {
    if (!container.contains(event.target)) {
      button.classList.remove("active");
      menu.classList.remove("active");
    }
  };
  document.addEventListener("click", outsideClickHandler);

  // Update display with selected items
  function updateDisplay() {
    display.innerHTML = '';
    
    if (selectedValues.size === 0) {
      display.innerHTML = `<span class="multi-select-placeholder">${placeholderText}</span>`;
      hiddenInput.value = '';
    } else {
      // Create tags for selected items
      selectedValues.forEach(value => {
        const item = menu.querySelector(`.multi-select-item[data-value="${value}"]`);
        if (!item) return;
        
        const tag = document.createElement('span');
        tag.className = 'multi-select-tag';
        tag.innerHTML = `
          <span class="multi-select-tag-text">${item.textContent.trim()}</span>
          <button type="button" class="multi-select-tag-close" data-value="${value}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        `;
        
        display.appendChild(tag);
      });

      // Update hidden input
      hiddenInput.value = Array.from(selectedValues).join(',');
    }

    // Dispatch change event
    const changeEvent = new CustomEvent("multiselect:change", {
      bubbles: true,
      detail: { container, selectedValues: Array.from(selectedValues), hiddenInput },
    });
    container.dispatchEvent(changeEvent);
  }

  // Handle tag removal
  const tagRemovalHandler = (e) => {
    const closeBtn = e.target.closest('.multi-select-tag-close');
    if (closeBtn) {
      e.stopPropagation();
      const value = closeBtn.getAttribute('data-value');
      
      // Remove from selected values
      selectedValues.delete(value);
      
      // Update checkbox state
      const item = menu.querySelector(`.multi-select-item[data-value="${value}"]`);
      if (item) {
        const checkbox = item.querySelector('.multi-select-checkbox');
        if (checkbox) checkbox.classList.remove('checked');
      }
      
      updateDisplay();
    }
  };
  display.addEventListener('click', tagRemovalHandler);

  // Item selection
  const items = container.querySelectorAll(".multi-select-item");
  items.forEach((item) => {
    const itemClickHandler = (e) => {
      e.stopPropagation();
      const value = item.getAttribute("data-value");
      const checkbox = item.querySelector('.multi-select-checkbox');
      
      if (!value) return;

      // Toggle selection
      if (selectedValues.has(value)) {
        selectedValues.delete(value);
        if (checkbox) checkbox.classList.remove('checked');
      } else {
        selectedValues.add(value);
        if (checkbox) checkbox.classList.add('checked');
      }

      updateDisplay();
    };
    item.addEventListener("click", itemClickHandler);
  });

  // Initialize from hidden input value if present
  if (hiddenInput.value && hiddenInput.value.trim() !== '') {
    const values = hiddenInput.value.split(',').filter(v => v.trim() !== '');
    values.forEach(value => {
      selectedValues.add(value.trim());
      const item = menu.querySelector(`.multi-select-item[data-value="${value.trim()}"]`);
      if (item) {
        const checkbox = item.querySelector('.multi-select-checkbox');
        if (checkbox) checkbox.classList.add('checked');
      }
    });
  }
  
  updateDisplay();
}

export function initMultiSelectDropdowns(root = document) {
  const containers = root.querySelectorAll(".multi-select-container");
  containers.forEach(initMultiSelectDropdown);
}

// Export for re-initialization
export function reinitMultiSelectDropdown(container) {
  // Remove initialization flag to allow re-init
  if (container.dataset.multiSelectInitialized === 'true') {
    container.dataset.multiSelectInitialized = 'false';
  }
  initMultiSelectDropdown(container);
}

// Auto-init on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initMultiSelectDropdowns());
} else {
  initMultiSelectDropdowns();
}
