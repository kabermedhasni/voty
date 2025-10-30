import { isSignUp, signInState, signUpState } from "./mode.js";

export const inputStates = {
  id: { isValid: false, hasError: false },
  password: { isValid: false, hasError: false },
};

// Input error animation
function updateModeStatus(inputId, status) {
  try {
    const state = isSignUp ? signUpState : signInState;
    if (inputId === "id") state.idStatus = status;
    if (inputId === "password") state.passwordStatus = status;
  } catch (_) {}
}

export function showInputError(inputElement) {
  // retrigger shake if already in error state
  if (inputElement.classList.contains("error")) {
    inputElement.classList.remove("error");
    void inputElement.offsetWidth;
  }
  // Allow shake animation only for this explicit error event
  const body = document.body;
  if (body) {
    body.classList.add("shake-enabled");
    setTimeout(() => {
      body.classList.remove("shake-enabled");
    }, 900);
  }
  inputElement.classList.add("error");
  inputElement.classList.remove("success");
  const inputId = inputElement.id;
  inputStates[inputId].hasError = true;
  inputStates[inputId].isValid = false;
  updateModeStatus(inputId, "error");
  updateSubmitButton();
}

// Input success styling
export function showInputSuccess(inputElement) {
  inputElement.classList.add("success");
  inputElement.classList.remove("error");
  const inputId = inputElement.id;
  inputStates[inputId].hasError = false;
  inputStates[inputId].isValid = true;
  updateModeStatus(inputId, "success");
  updateSubmitButton();
}

// Clear input styling
export function clearInputStyling(inputElement) {
  inputElement.classList.remove("error", "success");
  const inputId = inputElement.id;
  inputStates[inputId].hasError = false;
  inputStates[inputId].isValid = false;
  updateModeStatus(inputId, null);
  updateSubmitButton();
}

// Update submit button state
export function updateSubmitButton() {
  const submitBtn = document.getElementById("submitBtn");
  const idInput = document.getElementById("id");
  const passwordInputEl = document.getElementById("password");

  const idFilled = idInput.value.trim() !== "";
  const passwordFilled = passwordInputEl ? passwordInputEl.value.trim() !== "" : false;

  if (isSignUp) {
    // In sign up, ID alone is enough to proceed (password may be requested after)
    submitBtn.disabled = !idFilled;
  } else {
    // In sign in, require both ID and password
    submitBtn.disabled = !(idFilled && passwordFilled);
  }
}

// Clear all input errors
export function clearInputErrors() {
  document.querySelectorAll(".form-group input").forEach((input) => {
    input.classList.remove("error", "success");
    const inputId = input.id;
    inputStates[inputId].hasError = false;
    inputStates[inputId].isValid = false;
  });
  updateSubmitButton();
}
