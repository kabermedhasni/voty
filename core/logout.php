<?php
require_once __DIR__ . '/session.php';
init_session();

// Save language preference before destroying session
$savedLang = $_SESSION['lang'] ?? 'fr';

// Clear all session data
session_unset();
session_destroy();

// Start a fresh session and restore language preference
init_session();
$_SESSION['lang'] = $savedLang;

header('Location: ../auth');
exit();
