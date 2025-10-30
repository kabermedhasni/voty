<?php
require_once 'core/lang.php'; ?>
<!DOCTYPE html>
<html lang="<?php echo current_lang(); ?>" dir="<?php echo lang_dir(); ?>">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Voty</title>
  <link rel="stylesheet" href="assets/css/global.css" />
  <link rel="stylesheet" href="assets/css/utilities/animations.css" />
  <link rel="stylesheet" href="assets/css/utilities/spinner.css" />
  <link rel="stylesheet" href="assets/css/layout/header.css" />
  <link rel="stylesheet" href="assets/css/pages/index.css" />
  <link rel="stylesheet" href="assets/css/pages/candidates.css" />
  <link rel="stylesheet" href="assets/css/pages/results.css" />
  <link rel="stylesheet" href="assets/css/pages/about.css" />
  <link rel="stylesheet" href="assets/css/pages/contact.css" />
  <link rel="stylesheet" href="assets/css/layout/footer.css" />
  <link rel="icon" type="image/png" href="assets/images/voty.svg" />
  <script src="assets/js/utilities/linkDropdown.js" defer></script>
  <script src="assets/js/layout/header.js" defer></script>
</head>

<body class="page-fade-in">
  <!-- Mobile Header -->
  <header class="mobile-header" role="banner">
    <div class="brand">
      <a href="./"><img src="assets/images/voty.svg" alt="Voty" class="brand-icon" /></a>
    </div>
    <button class="hamburger" aria-label="Menu" aria-expanded="false">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </header>

  <div class="overlay"></div>

  <nav class="mobile-menu" aria-label="Primary">
    <ul class="nav-list">
      <li><a href="./" class="<?php echo (basename($_SERVER['PHP_SELF']) == 'index.php') ? 'active' : ''; ?>"><?php echo t('home', 'Accueil'); ?></a></li>
      <li><a href="profile.php" class="<?php echo (basename($_SERVER['PHP_SELF']) == 'profile.php') ? 'active' : ''; ?>"><?php echo t('profile', 'Profile'); ?></a></li>
      <li><a href="candidates.php" class="<?php echo (basename($_SERVER['PHP_SELF']) == 'candidates.php') ? 'active' : ''; ?>"><?php echo t('candidates', 'Candidats'); ?></a></li>
      <li><a href="results.php" class="<?php echo (basename($_SERVER['PHP_SELF']) == 'results.php') ? 'active' : ''; ?>"><?php echo t('results', 'Résultats'); ?></a></li>
      <li><a href="about.php" class="<?php echo (basename($_SERVER['PHP_SELF']) == 'about.php') ? 'active' : ''; ?>"><?php echo t('about', 'À propos'); ?></a></li>
      <li><a href="contact.php" class="<?php echo (basename($_SERVER['PHP_SELF']) == 'contact.php') ? 'active' : ''; ?>"><?php echo t('contact', 'Contact'); ?></a></li>
      <li><a href="core/logout.php" class="btn-danger"><?php echo t('logout', 'Déconnexion'); ?></a></li>
    </ul>
  </nav>

  <!-- Desktop Header -->
  <header class="app-header" role="banner">
    <div class="brand">
      <a href="./"><img src="assets/images/voty.svg" alt="Voty" class="brand-icon" /></a>
    </div>

    <nav class="primary-nav" aria-label="Primary">
      <ul class="nav-list">
        <li><a href="./" class="<?php echo (basename($_SERVER['PHP_SELF']) == 'index.php') ? 'active' : ''; ?>"><?php echo t('home', 'Accueil'); ?></a></li>
        <li><a href="candidates.php" class="<?php echo (basename($_SERVER['PHP_SELF']) == 'candidates.php') ? 'active' : ''; ?>"><?php echo t('candidates', 'Candidats'); ?></a></li>
        <li><a href="results.php" class="<?php echo (basename($_SERVER['PHP_SELF']) == 'results.php') ? 'active' : ''; ?>"><?php echo t('results', 'Résultats'); ?></a></li>
        <li><a href="about.php" class="<?php echo (basename($_SERVER['PHP_SELF']) == 'about.php') ? 'active' : ''; ?>"><?php echo t('about', 'À propos'); ?></a></li>
        <li><a href="contact.php" class="<?php echo (basename($_SERVER['PHP_SELF']) == 'contact.php') ? 'active' : ''; ?>"><?php echo t('contact', 'Contact'); ?></a></li>
      </ul>
    </nav>

    <div class="header-right">
      <a href="core/logout.php" class="dropdown-item dropdown-item-danger" data-loading="true">
        <span class="item-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
        </span>
        <span class="item-label btn-text"><?php echo t('logout', 'Déconnexion'); ?></span>
        <svg class="spinner-svg" viewBox="25 25 50 50">
          <circle r="20" cy="50" cx="50"></circle>
        </svg>
      </a>
    </div>
  </header>