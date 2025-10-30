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


<div class="admin-results-container">
    <div class="results-header">
        <h1 class="results-title"><?php echo t('election_results', 'Election Results'); ?></h1>
        <p class="results-subtitle"><?php echo t('view_voting_results', 'View voting results and statistics'); ?></p>
    </div>

    <!-- Election Selection -->
    <div class="results-section">
        <div class="section-header">
            <h2><?php echo t('select_election', 'Select Election'); ?></h2>
        </div>
        <div class="election-select-wrapper">
            <div class="dropdown-container" id="electionDropdown">
                <button type="button" class="dropdown-button" style="width: 100%;">
                    <span class="dropdown-text"><?php echo t('loading', 'Loading...'); ?></span>
                    <svg class="dropdown-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div class="dropdown-menu" id="electionDropdownMenu">
                    <!-- Items will be populated dynamically -->
                </div>
            </div>
            <input type="hidden" id="electionSelect">
        </div>
    </div>

    <!-- Results Display -->
    <div class="results-content" id="resultsContent">
        <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <h3><?php echo t('no_election_selected', 'No Election Selected'); ?></h3>
            <p><?php echo t('select_election_to_view', 'Please select an election to view its results'); ?></p>
        </div>
    </div>
</div>

<script src="../assets/js/utilities/utils.js" defer></script>
<script type="module" src="../assets/js/utilities/dropdown.js"></script>
<script src="../assets/js/pages/admin-results.js" defer></script>

<?php include '../includes/admin-footer.php'; ?>
