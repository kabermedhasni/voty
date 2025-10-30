<?php
require_once '../core/lang.php';
require_once '../core/config.php';

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

// Check if user is super_admin (redirect to super_admin pages)
if (isset($_SESSION['role']) && $_SESSION['role'] === 'super_admin') {
    header('Location: ../super_admin/dashboard.php');
    exit();
}

// If role is not 'admin', log out
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../core/logout');
    exit();
}

include '../includes/admin-header.php';
?>
<div class="admin-dashboard-container">
    
</div>
<script src="../assets/js/utilities/utils.js" defer></script>
<script src="../assets/js/pages/admin-dashboard.js" defer></script>

<?php include '../includes/admin-footer.php'; ?>
