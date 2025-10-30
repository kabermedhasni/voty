// Logout event handler for admin dashboard
function logout(event) {
  event.preventDefault();
  fadeOutAndRedirect("../core/logout.php");
}

// Attach logout event listener
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
});
