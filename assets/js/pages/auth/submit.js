import { isSignUp, signUpState } from "./mode.js";
import { apiCall, checkUserId } from "./api.js";
import { showToast } from "./toast.js";
import { showInputError, showInputSuccess, updateSubmitButton, clearInputStyling } from "./inputStyles.js";
import { passwordGroupEl, ensurePasswordPlaceholder } from "./password.js";
import { isPasswordValid, updatePasswordIndicator } from "./passwordRequirements.js";

// Form submission
document
  .getElementById("authForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    const userId = document.getElementById("id").value.trim();
    const passwordEl = document.getElementById("password");
    const password = passwordEl ? passwordEl.value : "";

    if (!userId) {
      showToast(window.translations?.enter_id || "Veuillez entrer votre ID.");
      return;
    }

    if (isSignUp) {
      // Sign up flow
      submitBtn.classList.add("btn-loading");
      const checkResult = await checkUserId(userId);
      submitBtn.classList.remove("btn-loading");
      
      if (!checkResult.success) {
        showToast(checkResult.message || "Erreur réseau. Veuillez réessayer.");
        return;
      }

      if (!checkResult.user_exists) {
        showInputError(document.getElementById("id"));
        // Hide password field with slide-out animation and reset stage
        const placeholder = ensurePasswordPlaceholder();
        const outClass = "input-slide-out-right";
        if (passwordGroupEl && passwordGroupEl.parentNode) {
          const onTransitionEnd = () => {
            passwordGroupEl.removeEventListener("transitionend", onTransitionEnd);
            passwordGroupEl.classList.remove(outClass);
            passwordGroupEl.replaceWith(placeholder);
          };
          passwordGroupEl.addEventListener("transitionend", onTransitionEnd, { once: true });
          // Trigger fade/slide out
          passwordGroupEl.classList.add(outClass);
        } else if (!placeholder.parentNode) {
          const idGroupRef = document.getElementById("idGroup");
          idGroupRef.insertAdjacentElement("afterend", placeholder);
        }
        signUpState.stage = "id";
        signUpState.validatedId = "";
        signUpState.passwordStatus = null;
        updateSubmitButton();
        showToast(window.translations?.id_incorrect || "L'ID est incorrect");
        return;
      }

      if (checkResult.has_password) {
        // If the user already has a password, hide the password field with animation for Sign Up
        const placeholder = ensurePasswordPlaceholder();
        const outClass = "input-slide-out-right";
        if (passwordGroupEl && passwordGroupEl.parentNode) {
          const onTransitionEnd = () => {
            passwordGroupEl.removeEventListener("transitionend", onTransitionEnd);
            passwordGroupEl.classList.remove(outClass);
            passwordGroupEl.replaceWith(placeholder);
          };
          passwordGroupEl.addEventListener("transitionend", onTransitionEnd, { once: true });
          passwordGroupEl.classList.add(outClass);
        } else if (!placeholder.parentNode) {
          const idGroupRef = document.getElementById("idGroup");
          idGroupRef.insertAdjacentElement("afterend", placeholder);
        }
        signUpState.stage = "id";
        signUpState.validatedId = "";
        signUpState.passwordStatus = null;
        showToast(window.translations?.user_registered || "Cet utilisateur est déjà enregistré avec un mot de passe", "gray");
        return;
      }

    // user exists but has no password
    if (!passwordEl) {
        // Replace placeholder with password field
        const placeholder = document.getElementById("passwordPlaceholder");
        if (placeholder && placeholder.parentNode) {
          placeholder.replaceWith(passwordGroupEl);
        } else if (!passwordGroupEl.parentNode) {
          const idGroupRef = document.getElementById("idGroup");
          idGroupRef.insertAdjacentElement("afterend", passwordGroupEl);
        }
        passwordGroupEl.classList.add("input-slide-out-right");
        setTimeout(() => {
          passwordGroupEl.classList.remove("input-slide-out-right");
        }, 50);
        // Clear any previous password error/success styling when showing it again
        const pwdField = document.getElementById("password");
        if (pwdField) {
          clearInputStyling(pwdField);
        }
        // Mark ID as valid (turn green) and prompt to set password
        showInputSuccess(document.getElementById("id"));
        showToast(window.translations?.set_password || "Définissez maintenant un mot de passe", "success");
        // Remember that we are now in the password step for Sign Up
        signUpState.stage = "password";
        signUpState.validatedId = userId;
        updateSubmitButton();
        updatePasswordIndicator();
        return;
      }
      // If password field is visible but empty
      if (!password) {
        // If the user changed to a new valid ID, treat this as (re)entering the password step
        if (signUpState.validatedId !== userId) {
          showInputSuccess(document.getElementById("id"));
          const pwdField = document.getElementById("password");
          if (pwdField) {
            clearInputStyling(pwdField); // ensure password returns to neutral state
          }
          signUpState.stage = "password";
          signUpState.validatedId = userId;
          updateSubmitButton();
          updatePasswordIndicator();
          showToast(window.translations?.set_password || "Définissez maintenant un mot de passe", "success");
          return;
        }
        // Same ID and still empty: require password
        showInputError(passwordEl);
        showToast(window.translations?.password_required || "Le mot de passe est requis.");
        return;
      }

      // Validate password requirements
      if (!isPasswordValid(password)) {
        showInputError(passwordEl);
        showToast(window.translations?.password_requirements_not_met || "Le mot de passe ne répond pas aux exigences.");
        return;
      }

      submitBtn.classList.add("btn-loading");
      const result = await apiCall("sign_up", {
        user_id: userId,
        password: password,
      });

      if (result.success) {
        // Keep spinner showing during redirect
        // Ensure password input returns to neutral state on success (if present)
        if (passwordEl) {
          clearInputStyling(passwordEl);
        }
        showToast(window.translations?.account_created || "Compte créé avec succès!", "success");
        setTimeout(() => {
if (window.fadeOutAndRedirect) {
window.fadeOutAndRedirect(result.redirect || "./");
          } else {
window.location.assign(result.redirect || "./");
          }
        }, 1500);
      } else {
        submitBtn.classList.remove("btn-loading");
        if (result.error === "invalid_id") {
          showInputError(document.getElementById("id"));
          showToast(window.translations?.id_incorrect || "L'ID est incorrect");
        } else if (result.error === "password_required") {
          showInputError(passwordEl);
        } else if (result.error === "password_exists") {
          showToast(result.message);
        } else {
          showToast(result.message || window.translations?.something_wrong || "Quelque chose s'est mal passé");
        }
      }
    } else {
      // Sign in flow
      if (!password) {
        showInputError(passwordEl);
        showToast(window.translations?.password_required || "Le mot de passe est requis.");
        return;
      }

      submitBtn.classList.add("btn-loading");
      const result = await apiCall("sign_in", {
        user_id: userId,
        password: password,
      });

      if (result.success) {
        // Keep spinner showing during redirect
        // Clear password styling to return to neutral state on successful sign in
        if (passwordEl) {
          clearInputStyling(passwordEl);
        }
        showToast(window.translations?.login_successful || "Connexion réussie!", "success");
        setTimeout(() => {
if (window.fadeOutAndRedirect) {
window.fadeOutAndRedirect(result.redirect || "./");
          } else {
window.location.assign(result.redirect || "./");
          }
        }, 1500);
      } else {
        submitBtn.classList.remove("btn-loading");
        if (result.error === "invalid_id") {
          // Turn ID red and show toast
          showInputError(document.getElementById("id"));
          // Clear password error state since the issue is with the ID, not the password
          clearInputStyling(passwordEl);
          showToast(window.translations?.id_incorrect || "L'ID est incorrect");
        } else if (result.error === "invalid_password") {
          showInputError(passwordEl);
          showToast(window.translations?.password_wrong || "Le mot de passe est incorrect.");
        } else if (result.error === "no_password") {
          showToast(window.translations?.no_password_set || result.message, "gray");
        } else {
          showToast(result.message || window.translations?.login_failed || "Échec de la connexion");
        }
      }
    }
  });
