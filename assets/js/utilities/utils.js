(function () {
  function fadeOutAndRedirect(targetUrl) {
    try {
      var body = document.body;
      if (body && !body.classList.contains("page-fade-out")) {
        body.classList.add("page-fade-out");
      }
    } catch (e) {
      // no-op: proceed to redirect even if class toggling fails
    }

    // Match the CSS fade duration (animations.css -> fadeIn: 0.5s)
    var delayMs = 500;
    setTimeout(function () {
      // Use assign to keep history; replace() if you want to avoid back navigation
      window.location.assign(targetUrl);
    }, delayMs);
  }

  // Expose globally
  window.fadeOutAndRedirect = fadeOutAndRedirect;
})();
