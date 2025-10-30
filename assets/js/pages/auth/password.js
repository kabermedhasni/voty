const toggleButton = document.getElementById("togglePassword");
export const passwordInput = document.getElementById("password");
export const passwordGroupEl = document.getElementById("passwordGroup");
let passwordPlaceholder = null;
let passwordGroupMeasuredHeight = null;
export function ensurePasswordPlaceholder() {
  if (!passwordPlaceholder) {
    passwordPlaceholder = document.createElement("div");
    passwordPlaceholder.id = "passwordPlaceholder";
    passwordPlaceholder.className = "form-group";
  }
  if (passwordGroupMeasuredHeight == null && passwordGroupEl) {
    // Measure once when element is in DOM
    const rect = passwordGroupEl.getBoundingClientRect();
    passwordGroupMeasuredHeight = rect.height || passwordGroupEl.offsetHeight || 80;
  }
  // Maintain space similar to password group height
  passwordPlaceholder.style.minHeight = `${passwordGroupMeasuredHeight || 80}px`;
  return passwordPlaceholder;
}

toggleButton.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  this.classList.toggle("hidden");
});
