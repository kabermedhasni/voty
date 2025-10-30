<?php 
require_once '../core/config.php';
require_once '../core/lang.php';
require_once './crypto.php';

// Helper function to fetch user by ID
function getUserById($pdo, $userId, $HMAC_KEY)
{
    $user_id_hmac = hmac_national_id($userId, $HMAC_KEY);
    $stmt = $pdo->prepare(
        'SELECT user_id_hmac, password_hash, role FROM users WHERE user_id_hmac = ?',
    );
    $stmt->execute([$user_id_hmac]);
    return $stmt->fetch();
}

// Helper function to initialize user session
function initializeSession($user)
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['user_id'] = $user['user_id_hmac'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['logged_in'] = true;
}

// Handle authentication requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit();
    }

    $action = $input['action'] ?? '';
    // Sanitize and validate user input
    $userId = trim($input['user_id'] ?? '');
    $password = $input['password'] ?? '';

    // Validate action to prevent unexpected values
    $allowedActions = ['check_user_id', 'sign_in', 'sign_up'];
    if (!in_array($action, $allowedActions)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        exit();
    }

    try {
        switch ($action) {
            case 'check_user_id':
                // Check if user ID exists in database
                $user = getUserById($pdo, $userId, $HMAC_KEY);

                if ($user) {
                    echo json_encode([
                        'success' => true,
                        'user_exists' => true,
                        'has_password' => !empty($user['password_hash']),
                    ]);
                } else {
                    echo json_encode([
                        'success' => true,
                        'user_exists' => false,
                        'has_password' => false,
                    ]);
                }
                break;

            case 'sign_in':
                // Sign in with ID and password
                $user = getUserById($pdo, $userId, $HMAC_KEY);

                if (!$user) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'invalid_id',
                        'message' => 'ID is incorrect.',
                    ]);
                    break;
                }

                if (empty($user['password_hash'])) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'no_password',
                        'message' => t(
                            'no_password_set',
                            'No password set for this account. Please sign up first.',
                        ),
                    ]);
                    break;
                }

                if (!password_verify($password, $user['password_hash'])) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'invalid_password',
                        'message' => 'Password is wrong.',
                    ]);
                    break;
                }

                // Successful login
                initializeSession($user);

                // Determine redirect based on role
                if ($user['role'] === 'super_admin') { $redirect = 'super_admin/dashboard'; } else if ($user['role'] === 'admin') { $redirect = 'admin/dashboard'; } else { $redirect = './'; };

                echo json_encode([
                    'success' => true,
                    'message' => 'Login successful',
                    'redirect' => $redirect,
                ]);
                break;

            case 'sign_up':
                // Sign up - set password for existing user
                $user = getUserById($pdo, $userId, $HMAC_KEY);

                if (!$user) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'invalid_id',
                        'message' => 'ID is incorrect.',
                    ]);
                    break;
                }

                if (!empty($user['password_hash'])) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'password_exists',
                        'message' => 'This user is already registered with password',
                    ]);
                    break;
                }

                if (empty($password)) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'password_required',
                        'message' => 'Password is required.',
                    ]);
                    break;
                }

                // Validate password requirements
                if (
                    strlen($password) < 8 ||
                    !preg_match('/[A-Z]/', $password) ||
                    !preg_match('/[a-z]/', $password) ||
                    !preg_match('/[0-9]/', $password)
                ) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'password_requirements_not_met',
                        'message' =>
                            'Password must be at least 8 characters and contain uppercase, lowercase, and number.',
                    ]);
                    break;
                }

                // Hash password and update user
                $user_id_hmac = hmac_national_id($userId, $HMAC_KEY);
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE user_id_hmac = ?');
                $stmt->execute([$passwordHash, $user_id_hmac]);

                // Start session
                initializeSession($user);

                // Determine redirect based on role
                if ($user['role'] === 'super_admin') { $redirect = 'super_admin/dashboard'; } else if ($user['role'] === 'admin') { $redirect = 'admin/dashboard'; } else { $redirect = './'; };

                echo json_encode([
                    'success' => true,
                    'message' => 'Account created successfully',
                    'redirect' => $redirect,
                ]);
                break;

            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
                break;
        }
    } catch (PDOException $e) {
        // Log the actual error for debugging
        error_log('Database error in auth.php: ' . $e->getMessage());
        http_response_code(500);
        // Don't expose database details to the user
        echo json_encode(['error' => 'A database error occurred. Please try again later.']);
    } catch (Exception $e) {
        // Log the actual error for debugging
        error_log('Server error in auth.php: ' . $e->getMessage());
        http_response_code(500);
        // Don't expose server details to the user
        echo json_encode(['error' => 'A server error occurred. Please try again later.']);
    }
    exit();
}