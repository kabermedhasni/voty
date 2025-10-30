<?php
require_once 'core/lang.php';

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header('Location: auth');
    exit();
}

// If role is not set or is not 'user' or 'admin', log out
if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], ['user', 'admin'])) {
    header('Location: core/logout');
    exit();
}

include 'includes/header.php';
?>
<div class="about-container">
    <div class="container">
        <h1><?= t('title_about', 'Imaginez gérer vos élections étudiantes ainsi') ?></h1>
        <p class="lead"><?= t('subtitle_about', 'Vos données sont claires et fiables — le processus est sécurisé et transparent, les résultats sont vérifiables à 100 % pour renforcer la confiance de toute la communauté universitaire.') ?></p>

        <div class="grid">
            <div class="card">
                <h3><?= t('Peace_mind', 'Tranquillité d\'esprit') ?></h3>
                <p><?= t('Peace_mind_description', 'Chaque vote est enregistré et horodaté de manière sécurisée. Les bulletins sont immuables et audités pour garantir l\'intégrité du scrutin.') ?></p>
            </div>
            <div class="card">
                <h3><?= t('verifiable_results', 'Résultats 100% vérifiables') ?></h3>
                <p><?= t('verifiable_results_description', 'Les résultats peuvent être reproduits à partir des enregistrements publics et des preuves cryptographiques, ce qui permet à toute partie de vérifier l\'exactitude.') ?></p>
            </div>
            <div class="card">
                <h3><?= t('seecure_process', 'Processus sécurisé') ?></h3>
                <p><?= t('seecure_process_description', 'Authentification robuste des votants, protections anti-fraude et protocoles de chiffrement de bout en bout pour protéger la confidentialité des électeurs.') ?></p>
            </div>
            <div class="card">
                <h3><?= t('focus_on_what_matters', 'Concentrez-vous sur l\'essentiel') ?></h3>
                <p><?= t('focus_on_what_matters_description', 'L\'administration gagne du temps : gestion des listes électorales, communications et calendriers centralisés — moins de travail administratif, plus de débat.') ?></p>
            </div>
            <div class="card">
                <h3><?= t('Ready_to_vote', 'Prêt à voter') ?></h3>
                <p><?= t('Ready_to_vote_description', 'Interface simple pour s\'inscrire, vérifier son éligibilité et voter depuis un ordinateur ou un smartphone — accessibilité et compatibilité garantis.') ?></p>
            </div>
            <div class="card">
                <h3><?= t('Democratic_growth', 'Croissance démocratique') ?></h3>
                <p><?= t('Democratic_growth_description', 'Construisez une culture étudiante plus forte et plus participative grâce à des élections claires, inclusives et technologiquement fiables.') ?></p>
            </div>
        </div>
    </div>
</div>
<script src="assets/js/utilities/utils.js" defer></script>
<script src="assets/js/pages/about.js" defer></script>

<?php include 'includes/footer.php'; ?>
