import { isSignUp } from "./mode.js";

const passwordInput = document.getElementById("password");
const passwordIndicatorButton = document.getElementById("passwordIndicatorButton");
const requirementsPopover = document.getElementById("requirementsPopover");
const passwordGroupEl = document.getElementById("passwordGroup");

let isPopoverOpen = false;
let hoverTimeout;

// Validation functions
export function validatePassword(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
}

// Check if all requirements are met
export function isPasswordValid(password) {
  const validation = validatePassword(password);
  return validation.length && validation.uppercase && validation.lowercase && validation.number;
}

// Helper function to toggle requirement state
function toggleRequirement(requirementItem, isMet) {
  if (!requirementItem) return;
  
  // Toggle met class on the item (for text color)
  requirementItem.classList.toggle("met", isMet);
  
  // Toggle met class on the circle (for checkmark)
  const circle = requirementItem.querySelector(".requirement-circle");
  if (circle) {
    circle.classList.toggle("met", isMet);
  }
}

// Update requirements UI
function updateRequirements() {
  const password = passwordInput.value;
  const validation = validatePassword(password);

  // Update requirement items and their circles
  const reqLength = document.getElementById("req-length");
  const reqUppercase = document.getElementById("req-uppercase");
  const reqLowercase = document.getElementById("req-lowercase");
  const reqNumber = document.getElementById("req-number");

  // Toggle met class on both item and circle
  toggleRequirement(reqLength, validation.length);
  toggleRequirement(reqUppercase, validation.uppercase);
  toggleRequirement(reqLowercase, validation.lowercase);
  toggleRequirement(reqNumber, validation.number);

  // Show or hide the indicator button based on mode and password field visibility
  // Only show indicator when in sign-up mode and password field is visible
  if (isSignUp && passwordInput.offsetParent !== null && passwordGroupEl.parentNode) {
    passwordGroupEl.classList.add("show-indicator");
  } else {
    passwordGroupEl.classList.remove("show-indicator");
  }
}

// Show popover
function showPopover() {
  requirementsPopover.classList.add("show");
}

// Hide popover
function hidePopover() {
  if (!isPopoverOpen) {
    requirementsPopover.classList.remove("show");
  }
}

// Toggle popover on click
passwordIndicatorButton.addEventListener("click", (e) => {
  e.stopPropagation();
  isPopoverOpen = !isPopoverOpen;
  if (isPopoverOpen) {
    showPopover();
  } else {
    hidePopover();
  }
});

// Show on hover
passwordIndicatorButton.addEventListener("mouseenter", () => {
  clearTimeout(hoverTimeout);
  showPopover();
});

// Hide on mouse leave (with delay)
passwordIndicatorButton.addEventListener("mouseleave", () => {
  hoverTimeout = setTimeout(() => {
    hidePopover();
  }, 200);
});

// Keep popover open when hovering over it
requirementsPopover.addEventListener("mouseenter", () => {
  clearTimeout(hoverTimeout);
});

requirementsPopover.addEventListener("mouseleave", () => {
  hoverTimeout = setTimeout(() => {
    hidePopover();
  }, 200);
});

// Close popover when clicking outside
document.addEventListener("click", (e) => {
  if (!requirementsPopover.contains(e.target) && e.target !== passwordIndicatorButton) {
    isPopoverOpen = false;
    hidePopover();
  }
});

// Update requirements as user types
passwordInput.addEventListener("input", updateRequirements);

// Initial update
updateRequirements();

// Export function to manually trigger update (useful when password field is shown/hidden)
export function updatePasswordIndicator() {
  updateRequirements();
}
