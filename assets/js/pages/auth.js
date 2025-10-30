import "./auth/toast.js";
import "./auth/inputStyles.js";
import "./auth/api.js";
import "./auth/password.js";
import "./auth/passwordRequirements.js";
import "./auth/mode.js";
import "./auth/listeners.js";
import "./auth/submit.js";
import "./auth/init.js";
import "../utilities/dropdown.js";

// Language adapter: keep language switching behavior using the generic dropdown
// Listens for dropdown:select and applies lang change when the selected item uses data-lang

document.addEventListener("dropdown:select", (e) => {
  try {
    const item = e?.detail?.item;
    const selectedLang = item?.getAttribute("data-lang");
    if (!selectedLang || selectedLang === window.currentLang) return;

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("lang", selectedLang);

    if (window.fadeOutAndRedirect) {
      window.fadeOutAndRedirect(currentUrl.toString());
    } else {
      window.location.assign(currentUrl.toString());
    }
  } catch (_) {}
});
