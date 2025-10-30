<?php
// Database configuration
$host = 'localhost';
$dbname = 'voty';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    // Disable emulated prepared statements for better security
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    // Ensure strict type conversion
    $pdo->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, false);
} catch (PDOException $e) {
    // Don't expose database details in production
    error_log('Database connection failed: ' . $e->getMessage());
    die('Connection failed. Please contact support.');
}
