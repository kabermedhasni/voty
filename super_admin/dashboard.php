<?php
require_once '../core/lang.php';

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header('Location: ../auth');
    exit();
}

// Check if user has user role (redirect to user page)
if (isset($_SESSION['role']) && $_SESSION['role'] === 'user') {
    header('Location: ../');
    exit();
}

// Check if user has admin role (redirect to user page)
if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
    header('Location: ../admin/dashboard');
    exit();
}

// If role is not set or is not 'user', 'admin' or 'super_admin', log out
if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], ['user', 'admin', 'super_admin'])) {
    header('Location: ../core/logout');
    exit();
}

include '../includes/super-admin-header.php';
?>
  <div class="dashboard-container">
    <div class="dashboard-content">
    </div>
  </div>

  <script src="../assets/js/utilities/utils.js" defer></script>
  <script src="../assets/js/pages/super-admin-dashboard.js" defer></script>
<?php include '../includes/admin-footer.php'; ?>