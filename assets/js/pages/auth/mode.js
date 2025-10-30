import { updateSubmitButton } from "./inputStyles.js";
import { ensurePasswordPlaceholder, passwordGroupEl } from "./password.js";

export let isSignUp = false;
// Separate values for sign-in and sign-up to avoid mixing input states
export const signInState = { id: "", password: "", idStatus: null, passwordStatus: null };
export const signUpState = { id: "", password: "", stage: "id", validatedId: "", idStatus: null, passwordStatus: null };

// Toggle between sign in and sign up
export function toggleMode(event) {
  event.preventDefault();

  // Save current values before switching modes
  const idInput = document.getElementById("id");
  const passwordInput = document.getElementById("password");

  // Persist current input styles into the current mode state
  const getStatus = (el) => {
    if (!el) return null;
    if (el.classList.contains("error")) return "error";
    if (el.classList.contains("success")) return "success";
    return null;
  };
  if (isSignUp) {
    signUpState.id = idInput.value;
    signUpState.password = passwordInput ? passwordInput.value : "";
    signUpState.idStatus = getStatus(idInput);
    signUpState.passwordStatus = getStatus(passwordInput);
  } else {
    signInState.id = idInput.value;
    signInState.password = passwordInput ? passwordInput.value : "";
    signInState.idStatus = getStatus(idInput);
    signInState.passwordStatus = getStatus(passwordInput);
  }

  isSignUp = !isSignUp;

  const formTitle = document.getElementById("formTitle");
  const formSubtitle = document.getElementById("formSubtitle");
  const submitBtn = document.getElementById("submitBtn");
  const toggleText = document.getElementById("toggleText");
  const toggleLink = document.getElementById("toggleLink");

  const outClass = "input-slide-out-right";
  const onNextFrame = (fn) =>
    requestAnimationFrame(() => requestAnimationFrame(fn));

  const fadeTexts = (textChangeFn) => {
    [toggleText, toggleLink, formSubtitle].forEach((el) =>
      el.classList.add("hidden-opacity")
    );
    setTimeout(() => {
      textChangeFn();
      [toggleText, toggleLink, formSubtitle].forEach((el) =>
        el.classList.remove("hidden-opacity")
      );
    }, 250);
  };

  // Ensure fade transitions are enabled before toggling opacity
  [toggleText, toggleLink, formSubtitle].forEach((el) =>
    el.classList.add("text-fade")
  );

  if (isSignUp) {
    formTitle.textContent = window.translations?.get_started || "Commencer";
    fadeTexts(() => {
      formSubtitle.textContent = window.translations?.sign_up_subtitle || "Créer un nouveau compte";
      toggleText.textContent = window.translations?.already_have_account || "Vous avez déjà un compte?";
      toggleLink.textContent = window.translations?.sign_in || "Se connecter";
    });

    // For Sign Up: if user already reached password step, keep password visible;
    // otherwise, replace with placeholder to keep layout stable.
    if (signUpState.stage === "password") {
      const idGroup = document.getElementById("idGroup");
      const placeholder = document.getElementById("passwordPlaceholder");
      if (placeholder && placeholder.parentNode) {
        placeholder.replaceWith(passwordGroupEl);
      } else if (!passwordGroupEl.parentNode) {
        idGroup.insertAdjacentElement("afterend", passwordGroupEl);
      }
      // animate in
      passwordGroupEl.classList.add(outClass);
      onNextFrame(() => {
        passwordGroupEl.classList.remove(outClass);
      });
    } else {
      // Replace password input with a placeholder block to preserve layout
      // Animate password field out (left to right fade) before replacing with placeholder
      const placeholder = ensurePasswordPlaceholder();
      if (passwordGroupEl.parentNode) {
        passwordGroupEl.classList.add(outClass);
        const handler = () => {
          passwordGroupEl.removeEventListener("transitionend", handler);
          passwordGroupEl.classList.remove(outClass);
          passwordGroupEl.replaceWith(placeholder);
        };
        passwordGroupEl.addEventListener("transitionend", handler, { once: true });
      } else if (!placeholder.parentNode) {
        const idGroup = document.getElementById("idGroup");
        idGroup.insertAdjacentElement("afterend", placeholder);
      }
    }
  } else {
    formTitle.textContent = window.translations?.get_started || "Commencer";
    fadeTexts(() => {
      formSubtitle.textContent = window.translations?.sign_in_subtitle || "Connectez-vous à votre compte";
      toggleText.textContent = window.translations?.first_time || "Première fois?";
      toggleLink.textContent = window.translations?.sign_up || "S'inscrire";
    });

    // Ensure password is present for Sign In and animate in
    const idGroup = document.getElementById("idGroup");
    const placeholder = document.getElementById("passwordPlaceholder");
    if (placeholder && placeholder.parentNode) {
      placeholder.replaceWith(passwordGroupEl);
    } else if (!passwordGroupEl.parentNode) {
      idGroup.insertAdjacentElement("afterend", passwordGroupEl);
    }
    passwordGroupEl.classList.add(outClass);
    onNextFrame(() => {
      passwordGroupEl.classList.remove(outClass);
    });
  }

  // Load values for the new mode (keep sign-in and sign-up values separate)
  idInput.value = isSignUp ? signUpState.id : signInState.id;
  const pwdElNow = document.getElementById("password");
  if (pwdElNow) {
    // Set the current visible password field's value based on the active mode
    pwdElNow.value = isSignUp ? signUpState.password : signInState.password;
  }
  
  // Reset classes to avoid style bleed between modes
  idInput.classList.remove("error", "success");
  if (pwdElNow) pwdElNow.classList.remove("error", "success");
  
  // Apply classes from the new mode state without triggering shake
  const newState = isSignUp ? signUpState : signInState;
  const applyStatus = (el, status) => {
    if (!el || !status) return;
    if (status === "error") {
      // Add no-shake BEFORE adding error to suppress animation on this toggle
      el.classList.add("no-shake");
      el.classList.add("error");
      // Keep suppression briefly to avoid a new animation frame starting the shake
      setTimeout(() => {
        el.classList.remove("no-shake");
      }, 80);
    } else if (status === "success") {
      el.classList.add("success");
    }
  };
  applyStatus(idInput, newState.idStatus);
  applyStatus(pwdElNow, newState.passwordStatus);
  
  updateSubmitButton();
  updateSubmitButton();

  // Clear password requirements indicator when leaving Sign Up
  try {
    const reqPopover = document.getElementById("requirementsPopover");
    if (!isSignUp) {
      passwordGroupEl.classList.remove("show-indicator");
      if (reqPopover) reqPopover.classList.remove("show");
    }
  } catch (_) {}
}
