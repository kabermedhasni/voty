<?php
require_once 'core/config.php';
require_once 'core/lang.php';
require_once 'core/session.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: auth.php');
    exit();
}

// Check if user is super_admin (redirect to super_admin pages)
if (isset($_SESSION['role']) && $_SESSION['role'] === 'super_admin') {
    header('Location: super_admin/dashboard');
    exit();
}

// Store user ID for JavaScript
$userId = $_SESSION['user_id'];

include 'includes/header.php';
?>

<script>
  // Pass user ID to JavaScript
  document.body.dataset.userId = '<?php echo htmlspecialchars($userId); ?>';
</script>

<div class="vote-container">
  <div class="vote-content">
    
    <!-- Step 1: Election Selection -->
    <div class="vote-step" id="election-selection-step">
      <div class="step-header">
        <h1 class="step-title"><?php echo t('select_election', 'Select an Election'); ?></h1>
        <p class="step-subtitle"><?php echo t('select_election_desc', 'Choose which election you want to participate in'); ?></p>
      </div>
      
      <!-- Search Section -->
      <div class="search-section">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input type="text" id="searchElectionsInput" placeholder="<?php echo t('search_elections', 'Search elections...'); ?>">
        </div>
      </div>
      
      <div class="elections-grid" id="elections-grid">
        <!-- Elections will be loaded here dynamically -->
        <div class="loading-spinner">
          <svg class="spinner-svg" viewBox="25 25 50 50">
            <circle r="20" cy="50" cx="50"></circle>
          </svg>
          <p><?php echo t('loading_elections', 'Loading elections...'); ?></p>
        </div>
      </div>
    </div>

    <!-- Step 2: Position Selection -->
    <div class="vote-step hidden" id="position-selection-step">
      <div class="step-header">
        <button class="back-button" id="back-to-elections">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <?php echo t('back', 'Back'); ?>
        </button>
        <h1 class="step-title" id="election-title"></h1>
        <p class="step-subtitle"><?php echo t('select_position_desc', 'Select a position to vote for'); ?></p>
      </div>
      
      <div class="positions-list" id="positions-list">
        <!-- Positions will be loaded here -->
      </div>
    </div>

    <!-- Step 3: Candidate Selection -->
    <div class="vote-step hidden" id="candidate-selection-step">
      <div class="step-header">
        <button class="back-button" id="back-to-positions">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <?php echo t('back', 'Back'); ?>
        </button>
        <h2 class="step-title" id="position-title"></h2>
        <p class="step-subtitle"><?php echo t('select_candidate_desc', 'Choose your preferred candidate'); ?></p>
      </div>
      
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
      
      <div class="candidates-grid" id="candidates-grid">
        <!-- Candidates will be loaded here -->
      </div>

      <div class="vote-actions">
        <button class="submit-vote-btn" id="submit-vote-btn" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span class="btn-text"><?php echo t('submit_vote', 'Submit Vote'); ?></span>
          <svg class="spinner-svg" viewBox="25 25 50 50">
            <circle r="20" cy="50" cx="50"></circle>
          </svg>
        </button>
      </div>
    </div>

    <!-- Step 4: Confirmation -->
    <div class="vote-step hidden" id="confirmation-step">
      <div class="confirmation-content">
        <div class="confirmation-icon success">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h1 class="confirmation-title"><?php echo t('vote_submitted', 'Vote Submitted Successfully!'); ?></h1>
        <p class="confirmation-message"><?php echo t('vote_submitted_desc', 'Your vote has been securely recorded on the blockchain'); ?></p>
        
        <div class="confirmation-actions">
          <button class="btn-secondary" id="vote-another-position">
            <?php echo t('vote_another_position', 'Vote for Another Position'); ?>
          </button>
          <button class="btn-primary" id="back-to-home">
            <?php echo t('back_home', 'Back to Home'); ?>
          </button>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- Toast Container -->
<div class="toast-container" id="toastContainer"></div>

<script src="assets/js/utilities/utils.js" defer></script>
<script type="module" src="assets/js/pages/index.js"></script>

<?php include 'includes/footer.php'; ?>
