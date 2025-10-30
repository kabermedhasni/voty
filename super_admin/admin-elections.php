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

$stmt = $pdo->prepare(
    'SELECT e.* 
    FROM election e 
    ORDER BY e.id DESC'
);
$stmt->execute();
$elections = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get all admin users for the dropdown
$adminStmt = $pdo->prepare("SELECT id, username FROM users WHERE role = 'admin' ORDER BY username");
$adminStmt->execute();
$adminUsers = $adminStmt->fetchAll(PDO::FETCH_ASSOC);

include '../includes/super-admin-header.php';
?>
<div class="admin-elections-container">
    <div class="header-elections">
        <h1><?php echo t('manage_elections', 'Gérer les élections'); ?></h1>
        <div class="btn-add-election">
            <button class="add-election" onclick="addElection(<?= '\''.$current_lang.'\''; ?>)"><?php echo t('add_election', 'Ajouter une nouvelle élection'); ?></button>
        </div>
    </div>
    <div class="elections-grid">
        <?php foreach($elections as $election): ?>
            <div class="election-card">
                <div class="election-card-header">
                    <div class="election-year-badge"><?= $election['year']; ?></div>
                    <?php if( $election['status'] === 1 ): ?>
                        <span class="status-badge status-active"><?php echo t('active', 'Actif'); ?></span>
                    <?php else: ?>
                        <span class="status-badge status-inactive"><?php echo t('inactive', 'Inactif'); ?></span>
                    <?php endif ?>
                </div>
                
                <div class="election-card-body">
                    <h3 class="election-organizer"><?= $election[$current_lang.'_organizer']; ?></h3>
                    
                    <div class="election-dates">
                        <div class="date-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span><?php echo t('start', 'Début'); ?>: <strong><?= $election['start_date']; ?></strong></span>
                        </div>
                        <div class="date-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span><?php echo t('end', 'Fin'); ?>: <strong><?= $election['end_date']; ?></strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="election-card-actions">
                    <button class="btn-primary btn-block" onclick="editElection(<?= $election['id']; ?>, <?= '\''.$current_lang.'\'' ?>)" style="margin-bottom: 0.5rem;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16.04 3.02001L8.16 10.9C7.86 11.2 7.56 11.79 7.5 12.22L7.07 15.23C6.91 16.32 7.68 17.08 8.77 16.93L11.78 16.5C12.2 16.44 12.79 16.14 13.1 15.84L20.98 7.96001C22.34 6.60001 22.98 5.02001 20.98 3.02001C18.98 1.02001 17.4 1.66001 16.04 3.02001Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M14.91 4.1499C15.58 6.5399 17.45 8.4099 19.85 9.0899" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <?php echo t('edit','Modifier'); ?>
                    </button>
                    
                    <?php if( $election['status'] === 1 ): ?>
                        <button class="btn-danger btn-block" onclick="stopElection(<?= $election['id']; ?>, <?= '\''.$current_lang.'\'' ?>)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM15.36 14.3C15.65 14.59 15.65 15.07 15.36 15.36C15.21 15.51 15.02 15.58 14.83 15.58C14.64 15.58 14.45 15.51 14.3 15.36L12 13.06L9.7 15.36C9.55 15.51 9.36 15.58 9.17 15.58C8.98 15.58 8.79 15.51 8.64 15.36C8.35 15.07 8.35 14.59 8.64 14.3L10.94 12L8.64 9.7C8.35 9.41 8.35 8.93 8.64 8.64C8.93 8.35 9.41 8.35 9.7 8.64L12 10.94L14.3 8.64C14.59 8.35 15.07 8.35 15.36 8.64C15.65 8.93 15.65 9.41 15.36 9.7L13.06 12L15.36 14.3Z" fill="currentColor"/>
                            </svg>
                            <?php echo t('btn_stop_election','Arrêter les élections'); ?>
                        </button>
                    <?php else: ?>
                        <button class="btn-secondary btn-block" disabled>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2Z" fill="currentColor"/>
                            </svg>
                            <?php echo t('election_stopped','Élection arrêtée'); ?>
                        </button>
                    <?php endif ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- Modal for Stop Election Confirmation -->
    <div class="modal" id="stopElectionModal">
        <div class="modal-overlay"></div>
        <div class="modal-content modal-small">
            <div class="modal-header">
                <h2><?php echo t('stop_election', 'Arrêter l\'élection'); ?></h2>
                <button class="modal-close" id="closeStopElectionModal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <p id="stopElectionMessage" style="color: #ccc; text-align: center; margin-bottom: 2rem;"></p>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" id="stopElectionNo">
                        <?php echo t('no', 'Non'); ?>
                    </button>
                    <button type="button" class="btn-danger" id="stopElectionYes">
                        <?php echo t('yes', 'Oui'); ?>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal for Add Election -->
    <div class="modal" id="addElectionModal">
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2><?php echo t('add_election', 'Ajouter une élection'); ?></h2>
                <button class="modal-close" id="closeAddElectionModal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            <form class="modal-body" id="addElectionForm">
                <div class="form-section">
                    <h3><?php echo t('election_information', 'Informations sur l\'élection'); ?></h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <h6><?php echo t('organizer_ar', 'المنظم (العربية)'); ?> <span class="required">*</span></h6>
                            <input type="text" id="election_ar_organizer" name="ar_organizer" required dir="rtl">
                        </div>
                        <div class="form-group">
                            <h6><?php echo t('organizer_en', 'Organizer (English)'); ?> <span class="required">*</span></h6>
                            <input type="text" id="election_en_organizer" name="en_organizer" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <h6><?php echo t('organizer_fr', 'Organisateur (Français)'); ?> <span class="required">*</span></h6>
                        <input type="text" id="election_fr_organizer" name="fr_organizer" required>
                    </div>

                    <div class="form-group">
                        <h6><?php echo t('admin_responsible', 'Administrateur responsable'); ?> <span class="required">*</span></h6>
                        <div class="multi-select-container" id="adminMultiSelect">
                            <div class="multi-select-button">
                                <div class="multi-select-display" data-placeholder="<?php echo t('select_admins', 'Sélectionner les administrateurs'); ?>"></div>
                                <span class="multi-select-chevron">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </span>
                            </div>
                            <div class="multi-select-menu">
                                <?php foreach($adminUsers as $admin): ?>
                                    <div class="multi-select-item" data-value="<?= $admin['id']; ?>">
                                        <span class="multi-select-checkbox"></span>
                                        <span><?= htmlspecialchars($admin['username']); ?></span>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                            <input type="hidden" id="election_admin_user_ids" name="admin_user_ids">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3><?php echo t('election_dates', 'Dates de l\'élection'); ?></h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <h6><?php echo t('year', 'Année'); ?> <span class="required">*</span></h6>
                            <input type="number" id="election_year" name="year" required min="2000" max="2100">
                        </div>
                        <div class="form-group">
                            <h6><?php echo t('status', 'Statut'); ?> <span class="required">*</span></h6>
                            <select id="election_status" name="status" required>
                                <option value="1"><?php echo t('active', 'Actif'); ?></option>
                                <option value="0"><?php echo t('inactive', 'Inactif'); ?></option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <h6><?php echo t('start_date', 'Date de début'); ?> <span class="required">*</span></h6>
                            <input type="date" id="election_start_date" name="start_date" required>
                        </div>
                        <div class="form-group">
                            <h6><?php echo t('end_date', 'Date de fin'); ?> <span class="required">*</span></h6>
                            <input type="date" id="election_end_date" name="end_date" required>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" id="cancelAddElectionBtn">
                        <?php echo t('cancel', 'Annuler'); ?>
                    </button>
                    <button type="submit" class="btn-primary" id="saveElectionBtn">
                        <span class="btn-text"><?php echo t('save', 'Enregistrer'); ?></span>
                        <svg class="spinner-svg" viewBox="25 25 50 50">
                            <circle r="20" cy="50" cx="50"></circle>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    </div>



</div>
<script src="../assets/js/utilities/utils.js" defer></script>
<script type="module" src="../assets/js/utilities/multi-select-dropdown.js"></script>
<script src="../assets/js/pages/super-admin-elections.js" defer></script>

<?php include '../includes/admin-footer.php'; ?>