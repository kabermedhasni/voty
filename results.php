<?php
require_once 'core/lang.php';
require_once 'core/config.php';

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header('Location: auth');
    exit();
}


// If role is not set or is not 'user', 'admin' or 'super_admin', log out
if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], ['user', 'admin', 'super_admin'])) {
    header('Location: core/logout');
    exit();
}

// Check if user is super_admin (redirect to super_admin pages)
if (isset($_SESSION['role']) && $_SESSION['role'] === 'super_admin') {
    header('Location: super_admin/dashboard.php');
    exit();
}

// Check if user has any elections assigned
$stmtAll = $pdo->prepare(
    'SELECT * FROM election WHERE id IN (SELECT id_election FROM `users_election` WHERE user_id_hmac = ?)',
);
$stmtAll->execute([$_SESSION['user_id']]);
$allElections = $stmtAll->fetchAll(PDO::FETCH_ASSOC);

// Get published elections
$stmt = $pdo->prepare(
    'SELECT * FROM election WHERE `results` = \'publish\' AND id IN (SELECT id_election FROM `users_election` WHERE user_id_hmac = ?)',
);
$stmt->execute([$_SESSION['user_id']]);
$elections = $stmt->fetchAll(PDO::FETCH_ASSOC);

function get_Positions_by_election($pdo, $id_election) {
  $stmt = $pdo->prepare(
    'SELECT * FROM `position` WHERE id_election = ?'
  );
  $stmt->execute([$id_election]);
  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function get_candidates_by_position($pdo, $id_position) {
  $stmt = $pdo->prepare(
    'SELECT * FROM `candidates` WHERE id_Position = ?'
  );
  $stmt->execute([$id_position]);
  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}


include 'includes/header.php';
?>
<div class="results-container">
    <?php if (count($elections) > 0): ?>
        <!-- Search Section -->
        <div class="search-section">
            <div class="search-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <input type="text" id="searchCandidatesInput" placeholder="<?php echo t('search_candidates', 'Search candidates...'); ?>">
            </div>
        </div>
        
        <?php foreach($elections as $election): ?>
            <div class="header">
                <span class="title"><?= (isset($election['election_type']) && trim($election['election_type']) !== '') ? ucfirst(trim($election['election_type'])) . ' Elections' : 'Elections' ?></span>
                <h2 class="year"><?= $election['year']; ?></h2>
                <h3 class="organizer">Organized by :  <span class="green"><?= $election[$current_lang.'_organizer']; ?></span></h3>
                <h1><?php echo t('list_of_candidates', 'List of candidates'); ?></h1>
            </div>
            <?php $positions = get_Positions_by_election($pdo, $election['id']); ?>
            <?php foreach($positions as $position): ?>
                <?php $candidates = get_candidates_by_position($pdo, $position['id']);?>
                <?php if(count($candidates) > 0): ?>
                    <div class="election-results">
                        <div class="position-header"><?= $position[$current_lang.'_name'] ?>: </div>
                        <?php foreach($candidates as $candidate): ?>
                            <div class="candidate-item">
                                <div class="candidate-info">
                                    <img src="<?= $candidate['photo_path'] ?>" class="photo-candidate">
                                    <span class="name"><?= ($current_lang === 'ar')? $candidate['ar_name'] : $candidate['name'] ?></span>
                                </div>
                                <span class="union snem"><?= $candidate['Supporting_party'] ?></span>
                                <img src="<?= $candidate['path_supporting_party_logo'] ?>" class="union-logo">
                                <span class="percentage" data-id="<?= $candidate['id'] ?>"></span>
                                <div class="separator-line"></div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php endforeach ?>
    <?php else: ?>
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <?php if (count($allElections) > 0): ?>
            <h3><?php echo t('results_not_published', 'Results Not Published Yet'); ?></h3>
            <p><?php echo t('results_not_published_msg', 'The election results have not been published yet. Please check back later.'); ?></p>
          <?php else: ?>
            <h3><?php echo t('no_elections_available', 'No Elections Available'); ?></h3>
            <p><?php echo t('no_elections_msg', 'There are currently no elections assigned to you.'); ?></p>
          <?php endif; ?>
        </div>
    <?php endif; ?>
</div>
<script src="assets/js/utilities/utils.js" defer></script>
<script src="assets/js/pages/results.js" defer></script>

<?php include 'includes/footer.php'; ?>
