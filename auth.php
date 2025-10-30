<?php
require_once 'core/lang.php';

// Redirect logged-in users to appropriate pages
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in']) {
    // Redirect to admin dashboard if user is admin, or to index page if regular user
    if (isset($_SESSEION['role'])) {
      $redirect;

      switch ($_SESSION['role']) {
        case 'super_admin':
          $redirect = 'super_admin/dashboard';
          break;

        case 'admin':
          $redirect = 'admin/dashboard';
          break;

        case 'user':
          $redirect = './';
          break;

        default:
          $redirect = './auth';
        break;
      }
    }
    header('Location: ' . $redirect);
    exit();
}

?>
<!DOCTYPE html>
<html lang="<?php echo current_lang(); ?>" dir="<?php echo lang_dir(); ?>">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Voty</title>
  <link rel="stylesheet" href="assets/css/global.css" />
  <link rel="stylesheet" href="assets/css/pages/auth.css" />
  <link rel="stylesheet" href="assets/css/utilities/animations.css" />
  <link rel="stylesheet" href="assets/css/utilities/spinner.css" />
  <link rel="icon" type="image/png" href="assets/images/voty.svg" />
</head>

<body class="page-fade-in">
  <div class="container">
    <div class="hero-section">
      <div class="hero-logo">
        <a href="./" class="logo-link">
          <img src="assets/images/voty.svg" alt="Voty Logo" class="logo-icon" />
        </a>
        <span class="logo-text">Voty</span>
      </div>
      <div class="hero-content">
        <h1><?php echo t('vote_your_way', 'Votez à votre façon'); ?></h1>
        <p>
          <?php echo t(
              'hero_description',
              'Explorez, choisissez et façonnez l\'avenir avec chaque vote. Rejoignez notre communauté, faites entendre votre voix.',
          ); ?>
        </p>
      </div>
    </div>

    <div class="form-section">
      <div class="form-container">
        <!-- Language Dropdown -->
        <div class="dropdown-container">
          <button
            class="dropdown-button"
            id="dropdownButton">
            <svg
              class="dropdown-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span class="dropdown-text"><?php echo t('language', 'Langue'); ?></span>
            <svg
              class="dropdown-chevron"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div class="dropdown-menu" id="dropdownMenu">
            <div class="dropdown-item" data-lang="fr">
              <span><?php echo t('french', 'Français'); ?></span>
            </div>
            <div class="dropdown-item" data-lang="en">
              <span><?php echo t('english', 'English'); ?></span>
            </div>
            <div class="dropdown-item" data-lang="ar">
              <span><?php echo t('arabic', 'العربية'); ?></span>
            </div>
          </div>
        </div>

        <div class="form-header">
          <h2 id="formTitle"><?php echo t('get_started', 'Commencer'); ?></h2>
          <p id="formSubtitle"><?php echo t(
              'sign_in_subtitle',
              'Connectez-vous à votre compte',
          ); ?></p>
        </div>

        <form id="authForm">
          <div class="form-group" id="idGroup">
            <h6 for="id"><?php echo t('id_label', 'NNI'); ?> <span class="required">*</span></h6>
            <input type="text" id="id" placeholder="<?php echo t('id_label', 'NNI'); ?>" required />
          </div>

          <div class="form-group" id="passwordGroup">
            <h6 for="password"><?php echo t(
                'password_label',
                'Mot de passe',
            ); ?> <span class="required">*</span></h6>
            <div class="input-wrapper">
              <input type="password" id="password" placeholder="••••••••" />
              <button
                type="button"
                class="password-indicator-button"
                id="passwordIndicatorButton"
                aria-label="Show password requirements">
                  <svg class="warning-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Rounded triangle -->
                    <path
                      d="M10.29 3.86c.77-1.33 2.65-1.33 3.42 0l8.17 14.06c.75 1.29-.19 2.91-1.71 2.91H3.83c-1.52 0-2.46-1.62-1.71-2.91L10.29 3.86Z"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                      stroke-linecap="round"
                      fill="none"
                    />
                    <!-- Exclamation line -->
                    <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <!-- Exclamation dot -->
                    <circle cx="12" cy="16.5" r="1.1" fill="currentColor"/>
                  </svg>

              </button>
              <button
                type="button"
                class="eye-button"
                id="togglePassword"
                aria-label="Toggle password visibility">
                <svg
                  class="eye-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor">
                  <g class="eye-paths">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </g>
                  <path
                    class="eye-slash"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 3l18 18" />
                </svg>
              </button>

              <div class="requirements-popover" id="requirementsPopover">
                <div class="popover-title"><?php echo t(
                    'password_requirements',
                    'Le mot de passe doit contenir:',
                ); ?></div>
                <div class="requirement-item" id="req-length">
                  <div class="requirement-circle"></div>
                  <div class="requirement-text"><?php echo t(
                      'req_8_chars',
                      'Au moins 8 caractères',
                  ); ?></div>
                </div>
                <div class="requirement-item" id="req-uppercase">
                  <div class="requirement-circle"></div>
                  <div class="requirement-text"><?php echo t(
                      'req_uppercase',
                      'Au moins une lettre majuscule',
                  ); ?></div>
                </div>
                <div class="requirement-item" id="req-lowercase">
                  <div class="requirement-circle"></div>
                  <div class="requirement-text"><?php echo t(
                      'req_lowercase',
                      'Au moins une lettre minuscule',
                  ); ?></div>
                </div>
                <div class="requirement-item" id="req-number">
                  <div class="requirement-circle"></div>
                  <div class="requirement-text"><?php echo t(
                      'req_number',
                      'Au moins un chiffre',
                  ); ?></div>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" class="submit-btn" id="submitBtn">
            <span class="btn-text"><?php echo t('continue', 'Continuer'); ?></span>
            <svg class="spinner-svg" viewBox="25 25 50 50">
              <circle r="20" cy="50" cx="50"></circle>
            </svg>
          </button>
        </form>

        <div class="form-footer">
          <span id="toggleText"><?php echo t('first_time', 'Première fois?'); ?></span>
          <a href="#" id="toggleLink"><?php echo t('sign_up', 'S\'inscrire'); ?></a>
        </div>

        <div class="terms">
          <?php echo t(
              'terms_text',
              'En continuant, vous acceptez nos',
          ); ?> <a href="#"><?php echo t(
     'terms_of_service',
     'Conditions d\'utilisation',
 ); ?></a> <?php echo t('and', 'et'); ?>
          <a href="#"><?php echo t(
              'privacy_policy',
              'Politique de confidentialité',
          ); ?></a><?php echo t('email_updates', 'et de recevoir des e-mails périodiques.'); ?>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Container -->
  <div class="toast-container" id="toastContainer"></div>

  <script src="core/translations.php" defer></script>
  <script src="assets/js/utilities/utils.js" defer></script>
  <script type="module" src="assets/js/pages/auth.js"></script>
</body>

</html>
