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
  <link rel="stylesheet" href="../assets/css/pages/super-admin-dashboard.css" />
  <link rel="stylesheet" href="../assets/css/pages/super-admin-elections.css" />
  <link rel="stylesheet" href="../assets/css/pages/super-admin-settings.css" />
  <link rel="stylesheet" href="../assets/css/pages/super-admin-candidates.css" />
  <link rel="stylesheet" href="../assets/css/pages/super-admin-results.css" />
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
                        <path class="a" d="m 32.5222,15.2134 c -0.749,1.4979 -3.69,3.9823 -3.9458,4.3659 -0.2558,0.3836 -2.4113,2.2651 -0.9681,3.4708 1.4432,1.2057 3.7083,-1.6989 4.4389,-2.1921 0.7306,-0.4932 4.3112,-1.4614 5.0784,-2.1007 0.7672,-0.6393 1.8267,-1.3153 2.1007-1.9912 l -1.4979,-4.75 c 0,0 -6.4484,-0.11 -7.307,0 -0.8586,0.11 -4.4639,4.9343 -3.9274,6.3753 0.6393,1.7173 2.8556,0.4065 2.8556,0.4065" id="path2" style="fill:none;fill-opacity:1;fill-rule:evenodd;stroke:#7d7d7d;stroke-opacity:1"/>
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
            <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'admin-settings.php'
                ? 'active'
                : ''; ?>" href="admin-settings.php">
              <span class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </span>
              <span class="label"><?php echo t('settings', 'Paramètres'); ?></span>
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