<?php
// Language management system
require_once __DIR__ . '/session.php';
init_session();

// Set default language to French
if (!isset($_SESSION['lang'])) {
    $_SESSION['lang'] = 'fr';
}

// Handle language change requests
if (isset($_GET['lang'])) {
    $allowed_langs = ['en', 'fr', 'ar'];
    $requested_lang = $_GET['lang'];

    if (in_array($requested_lang, $allowed_langs)) {
        $_SESSION['lang'] = $requested_lang;
    }

    // Determine how to handle the response based on request type
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $requestUri = $_SERVER['REQUEST_URI'] ?? '';
    $isAjax =
        isset($_SERVER['HTTP_X_REQUESTED_WITH']) &&
        strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

    // For AJAX calls, just set the language and return 204
    if ($isAjax) {
        // Add debug headers to help diagnose issues (can remove in production)
        header('X-Debug-Session-ID: ' . session_id());
        header('X-Debug-Lang-Set: ' . $_SESSION['lang']);
        header('X-Debug-Requested-Lang: ' . $requested_lang);
        http_response_code(204);
        exit();
    }

    // For normal GET page loads with ?lang parameter, redirect to clean URL
    // This works for ANY page (auth.php, index.php, etc.)
    if ($method === 'GET') {
        $parts = parse_url($requestUri);
        $path = $parts['path'] ?? '';
        $query = $parts['query'] ?? '';
        parse_str($query, $params);
        unset($params['lang']);
        $cleanQuery = http_build_query($params);
        $target = $path . ($cleanQuery ? '?' . $cleanQuery : '');
        header('Location: ' . $target, true, 302);
        exit();
    }
}

$current_lang = $_SESSION['lang'];

// Load translation file
$translations = [];
$lang_file = __DIR__ . "/../lang/{$current_lang}.php";

if (file_exists($lang_file)) {
    $translations = include $lang_file;
} else {
    // Fallback to French if file doesn't exist
    $translations = include __DIR__ . '/../lang/fr.php';
}

// Function to format dates according to current language
function format_localized_date($date_string)
{
    global $current_lang;

    if (empty($date_string)) {
        return '';
    }

    try {
        $date = new DateTime($date_string);

        switch ($current_lang) {
            case 'ar':
                // Arabic date format with Arabic numerals and month names
                $arabic_months = [
                    1 => 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
                ];
                $day = $date->format('j');
                $month = $arabic_months[(int)$date->format('n')];
                $year = $date->format('Y');

                // Convert Western numerals to Arabic numerals for the day
                $day_arabic = strtr($day, array_flip(range(0, 9)));
                $year_arabic = strtr($year, array_flip(range(0, 9)));

                return $day_arabic . ' ' . $month . '، ' . $year_arabic;

            case 'fr':
                // French date format
                $french_months = [
                    1 => 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
                ];
                $day = $date->format('j');
                $month = $french_months[(int)$date->format('n')];
                $year = $date->format('Y');

                return $day . ' ' . $month . ' ' . $year;

            default:
                // English date format (default)
                return $date->format('jS F, Y');
        }
    } catch (Exception $e) {
        // If date parsing fails, return the original string
        return $date_string;
    }
}

// Translation helper function
function t($key, $fallback = null)
{
    global $translations;
    $key_lower = strtolower($key);
    foreach ($translations as $k => $v) {
        if (strtolower($k) === $key_lower) {
            return $v;
        }
    }
    return $fallback ?? $key;
}

// Get current language direction
function lang_dir()
{
    global $current_lang;
    return $current_lang === 'ar' ? 'rtl' : 'ltr';
}

// Get current language code
function current_lang()
{
    global $current_lang;
    return $current_lang;
}
