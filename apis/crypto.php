<?php
require 'vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$AES_KEY = base64_decode($_ENV['AES_KEY']);
$HMAC_KEY = base64_decode($_ENV['HMAC_KEY']);


function normalize_email(string $email): string {
    return mb_strtolower(trim($email));
}

function normalize_national_id(string $id): string {
    return preg_replace('/\D+/', '', trim($id));
}

// ------- email crypto --------
function encrypt_email(string $plaintext, string $key): string {
    $iv = random_bytes(12); 
    $tag = '';
    $plaintext = normalize_email($plaintext);
    $ciphertext_raw = openssl_encrypt($plaintext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag, '', 16);
    if ($ciphertext_raw === false) throw new Exception("Encrypt failed");
    $package = $iv . $tag . $ciphertext_raw;
    return base64_encode($package);
}

function decrypt_email(string $b64package, string $key): ?string {
    $package = base64_decode($b64package, true);
    if ($package === false || strlen($package) < 28) return null;
    $iv = substr($package, 0, 12);
    $tag = substr($package, 12, 16);
    $ciphertext_raw = substr($package, 28);
    $plaintext = openssl_decrypt($ciphertext_raw, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag, '', 16);
    return $plaintext === false ? null : $plaintext;
}

// -------- HMAC User ID--------
function hmac_national_id(string $nationalId, string $hmacKey): string {
    $normalizedId = normalize_national_id($nationalId);
    $hmacRaw = hash_hmac('sha256', $normalizedId, $hmacKey, true);
    return base64_encode($hmacRaw);
}

function verify_national_id(string $inputId, string $storedHmac, string $hmacKey): bool {
    $computedHmac = hmac_national_id($inputId, $hmacKey);
    return hash_equals($computedHmac, $storedHmac);
}

