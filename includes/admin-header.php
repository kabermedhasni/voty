<?php
require_once '../core/lang.php'; ?>
<!DOCTYPE html>
<html lang="<?php echo current_lang(); ?>" dir="<?php echo lang_dir(); ?>">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Voty</title>
  <link rel="stylesheet" href="../assets/css/global.css" />
  <link rel="stylesheet" href="../assets/css/utilities/animations.css" />
  <link rel="stylesheet" href="../assets/css/utilities/spinner.css" />
  <link rel="stylesheet" href="../assets/css/layout/admin-header.css" />
  <link rel="stylesheet" href="../assets/css/pages/admin-dashboard.css" />
  <link rel="stylesheet" href="../assets/css/pages/admin-elections.css" />
  <link rel="stylesheet" href="../assets/css/pages/admin-candidates.css" />
  <link rel="stylesheet" href="../assets/css/pages/admin-results.css" />
  <link rel="stylesheet" href="../assets/css/layout/admin-footer.css" />
  <script src="../assets/js/layout/admin-header.js" defer></script>
  <link rel="icon" type="image/png" href="../assets/images/voty.svg" />
</head>

<body class="page-fade-in admin-layout">
  <aside class="admin-sidebar" data-collapsible="true" role="navigation" aria-label="Admin sidebar">
    <div class="sidebar-header">
      <a class="brand" href="dashboard.php">
        <img src="../assets/images/voty.svg" alt="Voty" class="brand-icon" />
        <span class="brand-name">Voty</span>
      </a>
    </div>

    <div class="sidebar-sections">

      <div class="sidebar-section">
        <div class="sidebar-separator"></div>
        <ul class="nav-list">

          <li>
            <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'dashboard.php'
                ? 'active'
                : ''; ?>" href="dashboard.php">
              <span class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                  fill="currentColor" class="size-6">
                  <path
                    d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                  <path
                    d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                </svg>
              </span>
              <span class="label"><?php echo t('dashboard', 'Tableau de bord'); ?></span>
            </a>
          </li>

          <li>
            <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'admin-elections.php'
                ? 'active'
                : ''; ?>" href="admin-elections.php">
              <span class="icon">
                <svg xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" width="55" height="20" viewBox="0 0 14.552079 10.583332" version="1.1" id="svg1" xml:space="preserve" inkscape:export-filename="elction.svg" inkscape:export-xdpi="96" inkscape:export-ydpi="96">
                  <sodipodi:namedview id="namedview1" pagecolor="#ffffff" bordercolor="#999999" borderopacity="1" inkscape:showpageshadow="2" inkscape:pageopacity="0" inkscape:pagecheckerboard="0" inkscape:deskcolor="#d1d1d1" inkscape:document-units="mm" inkscape:clip-to-page="true">
                    <inkscape:page x="0" y="0" width="14.552079" height="10.583332" id="page2" margin="0" bleed="0"/>
                  </sodipodi:namedview>
                  <defs id="defs1">
                    <style id="style1">.a{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;}</style>
                  </defs>
                  <g inkscape:label="Calque 1" inkscape:groupmode="layer" id="layer1">
                    <g style="fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#7d7d7d;stroke-width:1.5;stroke-opacity:1" id="g2" transform="matrix(0.35277778,0,0,0.35277778,-1.2230306,-3.2458027)">
                      <g id="SVGRepo_bgCarrier" stroke-width="0" style="fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#7d7d7d;stroke-opacity:1"/>
                      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" style="fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#7d7d7d;stroke-opacity:1"/>
                      <g id="SVGRepo_iconCarrier" style="fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#7d7d7d;stroke-opacity:1">
                        <defs id="defs1-0">
                          <style id="style2">.a{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;}</style>
                        </defs>
                        <polyline class="a" points="11.89 31.343 8.409 31.343 4.5 37.774 42.642 37.774 38.733 31.343 37.195 31.343" id="polyline1" style="fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#7d7d7d;stroke-opacity:1"/>
                        <polyline class="a" points="28.091 20.141 16.258 16.629 10.784 35.07 36.089 35.07 39.514 23.532 31.648 21.197" id="polyline2" style="fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#7d7d7d;stroke-opacity:1"/>
                        <path class="a" d="m 32.5222,15.2134 c -0.749,1.4979 -3.69,3.9823 -3.9458,4.3659 -0.2558,0.3836 -2.4113,2.2651 -0.9681,3.4708 1.4432,1.2057 3.7083,-1.6989 4.4389,-2.1921 0.7306,-0.4932 4.3112,-1.4614 5.0784,-2.1007 0.7672,-0.6393 1.8267,-1.3153 2.1007,-1.9912 l -1.4979,-4.75 c 0,0 -6.4484,-0.11 -7.307,0 -0.8586,0.11 -4.4639,4.9343 -3.9274,6.3753 0.6393,1.7173 2.8556,0.4065 2.8556,0.4065" id="path2" style="fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#7d7d7d;stroke-opacity:1"/>
                        <polyline class="a" points="37.728 12.017 41.108 10.226 43.5 16.629 39.226 16.766" id="polyline3" style="fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#7d7d7d;stroke-opacity:1"/>
                      </g>
                    </g>
                  </g>
                </svg>
              </span>
              <span class="label"><?php echo t('elections', 'Elections'); ?></span>
            </a>
          </li>

          <li>
            <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'admin-candidates.php'
                ? 'active'
                : ''; ?>" href="admin-candidates.php">
              <span class="icon">
                <svg width="20" height="20" fill="#7d7d7d" viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    transform="translate(5, 0)"
                    d="M23.313 26.102l-6.296-3.488c2.34-1.841 2.976-5.459 2.976-7.488v-4.223c0-2.796-3.715-5.91-7.447-5.91-3.73 0-7.544 3.114-7.544 5.91v4.223c0 1.845 0.78 5.576 3.144 7.472l-6.458 3.503s-1.688 0.752-1.688 1.689v2.534c0 0.933 0.757 1.689 1.688 1.689h21.625c0.931 0 1.688-0.757 1.688-1.689v-2.534c0-0.994-1.689-1.689-1.689-1.689zM23.001 30.015h-21.001v-1.788c0.143-0.105 0.344-0.226 0.502-0.298l6.459-3.503c0.589-0.32 0.979-0.912 1.039-1.579s-0.219-1.32-0.741-1.739c-1.677-1.345-2.396-4.322-2.396-5.911v-4.223c0-1.437 2.708-3.91 5.544-3.91 2.889 0 5.447 2.44 5.447 3.91v4.223c0 1.566-0.486 4.557-2.212 5.915-0.528 0.416-0.813 1.07-0.757 1.739s0.446 1.267 1.035 1.589l6.296 3.488c0.055 0.03 0.126 0.063 0.184 0.089 0.148 0.063 0.329 0.167 0.462 0.259v1.809z" />
                </svg>
              </span>
              <span class="label"><?php echo t('candidates', 'Candidats'); ?></span>
            </a>
          </li>

          <li>
            <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'admin-results.php'
                ? 'active'
                : ''; ?>" href="admin-results.php">
              <span class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 23 23" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                </svg>
              </span>
              <span class="label"><?php echo t('results', 'Résultats'); ?></span>
            </a>
          </li>
        </ul>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-separator"></div>
        <ul class="nav-list">
          <li>
            <a class="nav-link nav-danger" href="../core/logout.php" id="logoutBtn">
              <span class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
              </span>
              <span class="label btn-text"><?php echo t('logout', 'Déconnexion'); ?></span>
              <svg class="spinner-svg" viewBox="25 25 50 50">
                <circle r="20" cy="50" cx="50"></circle>
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </aside>