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

// Get the admin's database ID from their session user_id_hmac
$adminId = null;
if (isset($_SESSION['user_id'])) {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE user_id_hmac = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $result = $stmt->fetch();
    $adminId = $result ? (int)$result['id'] : null;
}

// Fetch admin's assigned elections and statistics
try {
    if (!$adminId) {
        throw new Exception('Admin ID not found');
    }

    // Get elections assigned to this admin
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT ea.election_id) as total 
        FROM election_admins ea 
        WHERE ea.admin_user_id = ?
    ");
    $stmt->execute([$adminId]);
    $myElections = $stmt->fetch()['total'];

    // Get active elections assigned to this admin
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT ea.election_id) as total 
        FROM election_admins ea 
        JOIN election e ON ea.election_id = e.id 
        WHERE ea.admin_user_id = ? AND e.status = 1
    ");
    $stmt->execute([$adminId]);
    $activeElections = $stmt->fetch()['total'];

    // Get total positions in admin's elections
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT p.id) as total 
        FROM position p 
        JOIN election_admins ea ON p.id_election = ea.election_id 
        WHERE ea.admin_user_id = ?
    ");
    $stmt->execute([$adminId]);
    $totalPositions = $stmt->fetch()['total'];

    // Get total candidates in admin's elections
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT c.id) as total 
        FROM candidates c 
        JOIN position p ON c.id_position = p.id 
        JOIN election_admins ea ON p.id_election = ea.election_id 
        WHERE ea.admin_user_id = ?
    ");
    $stmt->execute([$adminId]);
    $totalCandidates = $stmt->fetch()['total'];

    // Get recent elections assigned to this admin
    $stmt = $pdo->prepare("
        SELECT e.id, e.en_organizer, e.fr_organizer, e.ar_organizer, e.start_date, e.end_date, e.status 
        FROM election e 
        JOIN election_admins ea ON e.id = ea.election_id 
        WHERE ea.admin_user_id = ? 
        ORDER BY e.created_at DESC 
        LIMIT 3
    ");
    $stmt->execute([$adminId]);
    $recentElections = $stmt->fetchAll();

} catch (PDOException $e) {
    error_log('Admin dashboard query failed: ' . $e->getMessage());
    $myElections = $activeElections = $totalPositions = $totalCandidates = 0;
    $recentElections = [];
}
?>

<div class="admin-dashboard-container">
    <div class="dashboard-content">
        <div class="dashboard-header">
            <h1><?php echo t('dashboard', 'Dashboard'); ?></h1>
            <p class="dashboard-subtitle"><?php echo t('manage_elections', 'Manage Elections'); ?></p>
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
                    <h3><?php echo $myElections; ?></h3>
                    <p><?php echo t('my_elections', 'My Elections'); ?></p>
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
                <div class="stat-icon positions">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="stat-info">
                    <h3><?php echo $totalPositions; ?></h3>
                    <p><?php echo t('total_positions', 'Total Positions'); ?></p>
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
                <h2><?php echo t('my_recent_elections', 'My Recent Elections'); ?></h2>
                <a href="admin-elections.php" class="view-all"><?php echo t('view_all', 'View All'); ?></a>
            </div>
            
            <?php if (empty($recentElections)): ?>
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    <p><?php echo t('no_elections_assigned', 'No elections assigned'); ?></p>
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
<script src="../assets/js/pages/admin-dashboard.js" defer></script>

<?php include '../includes/admin-footer.php'; ?>
