<?php
/**
 * Centralized session configuration and initialization
 * Ensures sessions work properly on localhost, shared hosting, VPS, and HTTPS environments
 */

if (!function_exists('init_session')) {
    function init_session()
    {
        if (session_status() === PHP_SESSION_NONE) {
            // Detect if we're running on HTTPS (including reverse proxies and load balancers)
            $isHttps =
                (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
                (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) &&
                    $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ||
                (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) &&
                    $_SERVER['HTTP_X_FORWARDED_SSL'] === 'on');

            // Configure session cookies for security and compatibility across all hosting environments
            ini_set('session.cookie_samesite', 'Lax');
            if ($isHttps) {
                ini_set('session.cookie_secure', '1');
            }
            ini_set('session.cookie_httponly', '1');

            // Set cookie path to root to ensure it works across all pages
            ini_set('session.cookie_path', '/');

            // Increase session lifetime for better user experience
            ini_set('session.gc_maxlifetime', '86400'); // 24 hours
            ini_set('session.cookie_lifetime', '86400'); // 24 hours

            // Validate and clean session ID before starting session
            if (isset($_COOKIE[session_name()])) {
                if (!preg_match('/^[a-zA-Z0-9,\-]{1,128}$/', $_COOKIE[session_name()])) {
                    // Invalid session ID, remove cookie
                    setcookie(session_name(), '', time() - 3600, '/');
                    unset($_COOKIE[session_name()]);
                }
            }

            session_start();
        }
    }
}
