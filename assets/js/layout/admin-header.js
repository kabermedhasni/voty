// Handle logout button click with spinner
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Add loading class to show spinner
            logoutBtn.classList.add('btn-loading');

            // Navigate to logout page after a brief moment
            const logoutUrl = logoutBtn.getAttribute('href');
            window.location.href = logoutUrl;
        });
    }
});
