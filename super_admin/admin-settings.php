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

// No need to fetch positions anymore as they are on a separate page

include '../includes/super-admin-header.php';
?>
<div class="admin-settings-container">
    <div class="page-header">
        <h1><?php echo t('settings', 'Settings'); ?></h1>
    </div>


    <!-- Management Options Section -->
    <div class="settings-section">
        <div class="section-header">
            <h2><?php echo t('management_options', 'Management Options'); ?></h2>
        </div>

        <div class="management-grid">
            <!-- Manage Super Admins -->
            <div class="management-card">
                <div class="management-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="management-content">
                    <h3><?php echo t('manage_super_admins', 'Manage Super Administrators'); ?></h3>
                    <p><?php echo t('manage_super_admins_desc', 'Add, edit and delete super administrators'); ?></p>
                </div>
                <div class="management-action">
                    <a href="manage-super-admins.php" class="btn-primary">
                        <?php echo t('manage', 'Manage'); ?>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                </div>
            </div>

            <!-- Manage Admins -->
            <div class="management-card">
                <div class="management-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7ZM20 8V14M23 11H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="management-content">
                    <h3><?php echo t('manage_admins', 'Manage Administrators'); ?></h3>
                    <p><?php echo t('manage_admins_desc', 'Add, edit and delete administrators'); ?></p>
                </div>
                <div class="management-action">
                    <a href="manage-admins.php" class="btn-primary">
                        <?php echo t('manage', 'Manage'); ?>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Toast Container -->
<div class="toast-container" id="toastContainer"></div>

<script src="../assets/js/utilities/utils.js" defer></script>
<script src="../assets/js/utilities/toast.js" defer></script>

<?php include '../includes/admin-footer.php'; ?>
