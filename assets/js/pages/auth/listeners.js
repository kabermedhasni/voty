import { isSignUp, signInState, signUpState } from "./mode.js";
import { inputStates, clearInputStyling, updateSubmitButton } from "./inputStyles.js";

// ID input event listener for real-time validation
const idInput = document.getElementById("id");
idInput.addEventListener("input", function () {
  if (isSignUp) {
    signUpState.id = this.value;
  } else {
    signInState.id = this.value;
  }
  // Remove red error state and green success state as soon as the user edits
if (this.classList.contains("error")) {
    this.classList.remove("error");
    inputStates[this.id].hasError = false;
  }
  if (this.classList.contains("success")) {
    this.classList.remove("success");
    inputStates[this.id].isValid = false;
  }
  // Clear persisted styling state for the current mode on edit
  if (this.id === "id") {
    if (isSignUp) {
      signUpState.idStatus = null;
    } else {
      signInState.idStatus = null;
    }
  }
  updateSubmitButton();
  if (this.value.trim() === "") {
    clearInputStyling(this);
  }
});

// Password input event listener
const passwordInput = document.getElementById("password");
passwordInput.addEventListener("input", function () {
  if (isSignUp) {
    signUpState.password = this.value;
  } else {
    signInState.password = this.value;
  }
  // Remove red error state and green success state as soon as the user edits
  if (this.classList.contains("error")) {
    this.classList.remove("error");
    inputStates[this.id].hasError = false;
  }
  if (this.classList.contains("success")) {
    this.classList.remove("success");
    inputStates[this.id].isValid = false;
  }
  // Clear persisted styling state for the current mode on edit
  if (this.id === "password") {
    if (isSignUp) {
      signUpState.passwordStatus = null;
    } else {
      signInState.passwordStatus = null;
    }
  }
  updateSubmitButton();
  if (this.value.trim() === "") {
    clearInputStyling(this);
  }
});
