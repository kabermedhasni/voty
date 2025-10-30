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

  // Store selected values
  let selectedValues = [];
  const placeholderText = display.getAttribute("data-placeholder") || "Select options...";

  // Toggle open/close
  button.addEventListener("click", (e) => {
    // Don't toggle if clicking on a tag close button
    if (e.target.closest('.multi-select-tag-close')) return;
    
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

  // Update display with selected items
  function updateDisplay() {
    display.innerHTML = '';
    
    if (selectedValues.length === 0) {
      display.innerHTML = `<span class="multi-select-placeholder">${placeholderText}</span>`;
      return;
    }

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
    hiddenInput.value = selectedValues.join(',');

    // Dispatch change event
    const changeEvent = new CustomEvent("multiselect:change", {
      bubbles: true,
      detail: { container, selectedValues, hiddenInput },
    });
    container.dispatchEvent(changeEvent);
  }

  // Handle tag removal
  display.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('.multi-select-tag-close');
    if (closeBtn) {
      e.stopPropagation();
      const value = closeBtn.getAttribute('data-value');
      
      // Remove from selected values
      selectedValues = selectedValues.filter(v => v !== value);
      
      // Update checkbox state
      const item = menu.querySelector(`.multi-select-item[data-value="${value}"]`);
      if (item) {
        const checkbox = item.querySelector('.multi-select-checkbox');
        if (checkbox) checkbox.classList.remove('checked');
      }
      
      updateDisplay();
    }
  });

  // Item selection
  const items = container.querySelectorAll(".multi-select-item");
  items.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = item.getAttribute("data-value");
      const checkbox = item.querySelector('.multi-select-checkbox');
      
      if (!value) return;

      // Toggle selection
      if (selectedValues.includes(value)) {
        selectedValues = selectedValues.filter(v => v !== value);
        if (checkbox) checkbox.classList.remove('checked');
      } else {
        selectedValues.push(value);
        if (checkbox) checkbox.classList.add('checked');
      }

      updateDisplay();
    });
  });

  // Initialize from hidden input value if present
  if (hiddenInput.value) {
    selectedValues = hiddenInput.value.split(',').filter(v => v.trim() !== '');
    selectedValues.forEach(value => {
      const item = menu.querySelector(`.multi-select-item[data-value="${value}"]`);
      if (item) {
        const checkbox = item.querySelector('.multi-select-checkbox');
        if (checkbox) checkbox.classList.add('checked');
      }
    });
    updateDisplay();
  } else {
    updateDisplay();
  }
}

export function initMultiSelectDropdowns(root = document) {
  const containers = root.querySelectorAll(".multi-select-container");
  containers.forEach(initMultiSelectDropdown);
}

// Auto-init on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initMultiSelectDropdowns());
} else {
  initMultiSelectDropdowns();
}
