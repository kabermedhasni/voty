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

include 'includes/header.php';
?>
<?php
    // Fetch active elections for this user
    $stmtEle = $pdo->prepare("SELECT * FROM election WHERE status = 1 AND id IN (SELECT id_election FROM `users_election` WHERE user_id_hmac = ?) ORDER BY id");
    $stmtEle->execute([$_SESSION['user_id']]);
    $elections = $stmtEle->fetchAll(); 

?>
<div class="candidates-container">
    <?php if (count($elections) > 0): ?>
        <!-- Search Section -->
        <div class="search-section">
            <div class="search-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <input type="text" id="searchCandidatesInput" placeholder="<?php echo t('search_candidates', 'Rechercher des candidats...'); ?>">
            </div>
        </div>
        
        <?php foreach($elections as $election): ?>
            <div class="header">
                <span class="title"><?= !empty($election['election_type']) ? ucfirst($election['election_type']) . ' Elections' : 'Elections' ?></span>
                <h2 class="year"><?= $election['year']; ?></h2>
                <h3 class="organizer">Organized by :  <span class="green"><?= $election[$current_lang.'_organizer']; ?></span></h3>
                <h1><?php echo t('list_of_candidates', 'List of candidates:'); ?><span>:</span></h1>
            </div>

            <?php
            // Fetch positions and candidates
            $stmtPos = $pdo->prepare("SELECT * FROM position WHERE status = 1 AND id_election = ? ORDER BY id");
            $stmtPos->execute([$election['id']]);
            $positions = $stmtPos->fetchAll();

            $stmtCand = $pdo->prepare("SELECT * FROM candidates WHERE id_position IS NOT NULL ORDER BY id_position, id");
            $stmtCand->execute();
            $candidates = $stmtCand->fetchAll();

            // Group candidates by position id
            $byPos = [];
            foreach ($candidates as $c) {
                $pid = $c['id_position'];
                if (!isset($byPos[$pid])) $byPos[$pid] = [];
                $byPos[$pid][] = $c;
            }

            foreach ($positions as $pos) {
                $pid = $pos['id'];
                if (empty($byPos[$pid])) continue; // skip positions with no candidates
                $posName = $pos[$current_lang.'_name'];
                if (current_lang() === 'ar') { $posName = t($posName, $posName); }
                ?>
                <div class="candidates-list">
                    <div class="position-header"><?php echo htmlspecialchars($posName); ?><span>:</span></div>

                    <?php foreach ($byPos[$pid] as $cand) {
                        $photo = $cand['photo_path'] ?: 'assets/images/candidates/profile/candidate-placeholder.png';
                        $logo = $cand['path_supporting_party_logo'] ?: 'assets/images/candidates/party/party-placeholder.jpg';
                        $party = $cand['Supporting_party'];
                        $lang = current_lang();
                        if ($lang === 'ar') {
                            $name = $cand['ar_name'] ?: $cand['name'];
                            $bio = $cand['ar_description'] ?: $cand['en_description'];
                        } elseif ($lang === 'fr') {
                            $name = $cand['name'];
                            $bio = $cand['fr_description'] ?: $cand['en_description'];
                        } else {
                            $name = $cand['name'];
                            $bio = $cand['en_description'];
                        }
                    ?>
                    <div class="candidate-card" onclick="toggleCandidate(this)">
                        <div class="candidate-header">
                            <img src="<?php echo htmlspecialchars($photo); ?>" alt="<?php echo htmlspecialchars($name); ?>" class="candidate-photo">
                            <div class="candidate-info">
                                <div class="candidate-name"><?php echo htmlspecialchars($name); ?></div>
                            </div>
                            <div class="candidate-meta">
                                <div class="organization"><?php echo htmlspecialchars($party); ?></div>
                                <img src="<?php echo htmlspecialchars($logo); ?>" alt="<?php echo htmlspecialchars($party); ?>" class="party-logo" style="width:28px;height:28px;object-fit:contain;border-radius:4px;border:1px solid #3a3a3a;" />
                            </div>
                        </div>
                        <div class="candidate-details">
                            <div class="candidate-details-inner">
                                <div class="candidate-bio"><?php echo htmlspecialchars($bio); ?></div>
                            </div>
                        </div>
                        <div class="separator-line"></div>
                    </div>
                    <?php } ?>
                </div>
                <?php
            }
            ?>
        <?php endforeach; ?>
    <?php else: ?>
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h3>No Elections Available</h3>
          <p>There are currently no active elections.</p>
        </div>
    <?php endif; ?>
</div>
<script src="assets/js/utilities/utils.js" defer></script>
<script src="assets/js/pages/candidates.js" defer></script>

<?php include 'includes/footer.php'; ?>
