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

include '../includes/super-admin-header.php';

// Fetch dashboard statistics
try {
    // Total elections
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM election");
    $totalElections = $stmt->fetch()['total'];

    // Active elections
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM election WHERE status = 1");
    $activeElections = $stmt->fetch()['total'];

    // Total admins
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE role = 'admin'");
    $totalAdmins = $stmt->fetch()['total'];

    // Total candidates
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM candidates");
    $totalCandidates = $stmt->fetch()['total'];

    // Recent elections
    $stmt = $pdo->prepare("SELECT id, en_organizer, fr_organizer, ar_organizer, start_date, end_date, status FROM election ORDER BY created_at DESC LIMIT 3");
    $stmt->execute();
    $recentElections = $stmt->fetchAll();

} catch (PDOException $e) {
    error_log('Dashboard query failed: ' . $e->getMessage());
    $totalElections = $activeElections = $totalAdmins = $totalCandidates = 0;
    $recentElections = [];
}
?>

<div class="dashboard-container">
    <div class="dashboard-content">
        <div class="dashboard-header">
            <h1><?php echo t('dashboard', 'Dashboard'); ?></h1>
            <p class="dashboard-subtitle"><?php echo t('welcome_back', 'Welcome'); ?></p>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon elections">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.625 3.75a2.625 2.625 0 1 0 0 5.25h12.75a2.625 2.625 0 0 0 0-5.25H5.625ZM3.75 11.25a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75ZM3 15.75a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75ZM3.75 18.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75Z" />
                    </svg>
                </div>
                <div class="stat-info">
                    <h3><?php echo $totalElections; ?></h3>
                    <p><?php echo t('total_elections', 'Total des élections'); ?></p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon active">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="stat-info">
                    <h3><?php echo $activeElections; ?></h3>
                    <p><?php echo t('active_elections', 'Active Elections'); ?></p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon admins">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                    </svg>
                </div>
                <div class="stat-info">
                    <h3><?php echo $totalAdmins; ?></h3>
                    <p><?php echo t('total_admins', 'Total Admins'); ?></p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon candidates">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="stat-info">
                    <h3><?php echo $totalCandidates; ?></h3>
                    <p><?php echo t('total_candidates', 'Total Candidates'); ?></p>
                </div>
            </div>
        </div>

        <!-- Recent Elections -->
        <div class="recent-section">
            <div class="section-header">
                <h2><?php echo t('recent_elections', 'Recent Elections'); ?></h2>
                <a href="admin-elections.php" class="view-all"><?php echo t('view_all', 'View All'); ?></a>
            </div>
            
            <?php if (empty($recentElections)): ?>
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    <p><?php echo t('no_elections_yet', 'No elections yet'); ?></p>
                </div>
            <?php else: ?>
                <div class="elections-list">
                    <?php foreach ($recentElections as $election): 
                        $organizer = lang_dir() === 'rtl' ? $election['ar_organizer'] : (current_lang() === 'fr' ? $election['fr_organizer'] : $election['en_organizer']);
                        $statusClass = $election['status'] ? 'active' : 'inactive';
                    ?>
                        <div class="election-item">
                            <div class="election-info">
                                <h3><?php echo htmlspecialchars($organizer); ?></h3>
                                <p class="election-date">
                                    <?php echo date('M d, Y', strtotime($election['start_date'])); ?> - 
                                    <?php echo date('M d, Y', strtotime($election['end_date'])); ?>
                                </p>
                            </div>
                            <span class="status-badge <?php echo $statusClass; ?>">
                                <?php echo $election['status'] ? t('active', 'Active') : t('inactive', 'Inactive'); ?>
                            </span>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script src="../assets/js/utilities/utils.js" defer></script>
<script src="../assets/js/pages/super-admin-dashboard.js" defer></script>
<?php include '../includes/admin-footer.php'; ?>