import { clearInputErrors, updateSubmitButton } from "./inputStyles.js";
import { ensurePasswordPlaceholder } from "./password.js";
import { toggleMode, signInState, signUpState } from "./mode.js";

// Initialize submit button as disabled
document.addEventListener("DOMContentLoaded", function () {
  // Clear all inputs on page load to prevent browser autocomplete/state persistence
  const idInput = document.getElementById("id");
  const passwordInput = document.getElementById("password");
  
  idInput.value = "";
  passwordInput.value = "";
  signInState.id = "";
  signInState.password = "";
  signInState.idStatus = null;
  signInState.passwordStatus = null;

  signUpState.id = "";
  signUpState.password = "";
  signUpState.stage = "id";
  signUpState.validatedId = "";
  signUpState.idStatus = null;
  signUpState.passwordStatus = null;
  
  clearInputErrors();
  
  // Measure password group height early to size placeholder consistently
  ensurePasswordPlaceholder();
  updateSubmitButton();
  
  // Attach toggle mode event listener
  const toggleLink = document.getElementById("toggleLink");
  if (toggleLink) {
    toggleLink.addEventListener("click", toggleMode);
  }
});
