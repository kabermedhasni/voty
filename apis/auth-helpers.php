<?php
/**
 * Authorization Helper Functions
 * Centralizes role-based authorization logic for the Voty application
 */

require_once '../core/config.php';
require_once '../core/session.php';

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    init_session();
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

/**
 * Get current user ID from session
 */
function getCurrentUserId() {
    init_session();
    return $_SESSION['user_id'] ?? null;
}

/**
 * Get current user's internal database ID
 */
function getCurrentUserDbId($pdo) {
    $userId = getCurrentUserId();
    if (!$userId) {
        return null;
    }
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE user_id_hmac = ?");
    $stmt->execute([$userId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return $result ? (int)$result['id'] : null;
}

/**
 * Get current user's role
 */
function getCurrentUserRole() {
    init_session();
    return $_SESSION['role'] ?? 'user';
}

/**
 * Check if current user has a specific role
 */
function hasRole($role) {
    return getCurrentUserRole() === $role;
}

/**
 * Check if current user is a super admin
 */
function isSuperAdmin() {
    return hasRole('super_admin');
}

/**
 * Check if current user is an admin (not super_admin)
 */
function isAdmin() {
    return hasRole('admin');
}

/**
 * Check if current user is a regular user
 */
function isUser() {
    return hasRole('user');
}

/**
 * Check if user has admin privileges (admin or super_admin)
 */
function hasAdminPrivileges() {
    $role = getCurrentUserRole();
    return in_array($role, ['admin', 'super_admin']);
}

/**
 * Check if admin is assigned to a specific election
 */
function isAdminAssignedToElection($pdo, $electionId, $adminUserId = null) {
    if ($adminUserId === null) {
        $adminUserId = getCurrentUserDbId($pdo);
    }
    
    if (!$adminUserId || !$electionId) {
        return false;
    }
    
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM election_admins 
        WHERE admin_user_id = ? AND election_id = ?
    ");
    $stmt->execute([$adminUserId, $electionId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return $result && $result['count'] > 0;
}

/**
 * Check if user can edit an election
 * Super admins can edit any election, admins can only edit assigned elections
 */
function canEditElection($pdo, $electionId) {
    if (!isAuthenticated()) {
        return false;
    }
    
    // Super admins can edit any election
    if (isSuperAdmin()) {
        return true;
    }
    
    // Admins can only edit assigned elections
    if (isAdmin()) {
        return isAdminAssignedToElection($pdo, $electionId);
    }
    
    // Regular users cannot edit elections
    return false;
}

/**
 * Get list of elections an admin can manage
 */
function getAdminElections($pdo, $adminUserId = null) {
    if ($adminUserId === null) {
        $adminUserId = getCurrentUserDbId($pdo);
    }
    
    if (!$adminUserId) {
        return [];
    }
    
    // Super admins see all elections
    if (isSuperAdmin()) {
        $stmt = $pdo->prepare("
            SELECT e.*, 
            MAX(p.en_name) as position_en_name, 
            MAX(p.fr_name) as position_fr_name, 
            MAX(p.ar_name) as position_ar_name 
            FROM election e 
            LEFT JOIN position p ON e.id = p.id_election 
            GROUP BY e.id
            ORDER BY e.year DESC, e.id DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    // Admins only see assigned elections
    if (isAdmin()) {
        $stmt = $pdo->prepare("
            SELECT e.*, 
            MAX(p.en_name) as position_en_name, 
            MAX(p.fr_name) as position_fr_name, 
            MAX(p.ar_name) as position_ar_name 
            FROM election e
            INNER JOIN election_admins ea ON e.id = ea.election_id
            LEFT JOIN position p ON e.id = p.id_election
            WHERE ea.admin_user_id = ?
            GROUP BY e.id
            ORDER BY e.year DESC, e.id DESC
        ");
        $stmt->execute([$adminUserId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    return [];
}

/**
 * Validate that a position belongs to an election
 */
function validatePositionBelongsToElection($pdo, $positionId, $electionId) {
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM position 
        WHERE id = ? AND id_election = ?
    ");
    $stmt->execute([$positionId, $electionId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return $result && $result['count'] > 0;
}

/**
 * Get election ID from position ID
 */
function getElectionIdFromPosition($pdo, $positionId) {
    $stmt = $pdo->prepare("SELECT id_election FROM position WHERE id = ?");
    $stmt->execute([$positionId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return $result ? (int)$result['id_election'] : null;
}

/**
 * Check if user can manage candidates for a position
 */
function canManageCandidatesForPosition($pdo, $positionId) {
    if (!hasAdminPrivileges()) {
        return false;
    }
    
    $electionId = getElectionIdFromPosition($pdo, $positionId);
    if (!$electionId) {
        return false;
    }
    
    return canEditElection($pdo, $electionId);
}

/**
 * Get all users with 'admin' role (for assignment purposes)
 */
function getAdminUsers($pdo) {
    $stmt = $pdo->prepare("
        SELECT id, user_id_hmac, username, username_arabic, role 
        FROM users 
        WHERE role = 'admin' 
        ORDER BY username ASC
    ");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Assign admin to election (super_admin only)
 */
function assignAdminToElection($pdo, $adminUserId, $electionId) {
    if (!isSuperAdmin()) {
        return ['success' => false, 'message' => 'Only super admins can assign admins to elections'];
    }
    
    // Check if user is actually an admin
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$adminUserId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || $user['role'] !== 'admin') {
        return ['success' => false, 'message' => 'User must have admin role to be assigned'];
    }
    
    // Check if already assigned
    if (isAdminAssignedToElection($pdo, $electionId, $adminUserId)) {
        return ['success' => false, 'message' => 'Admin is already assigned to this election'];
    }
    
    // Insert assignment
    try {
        $stmt = $pdo->prepare("
            INSERT INTO election_admins (admin_user_id, election_id, assigned_at) 
            VALUES (?, ?, NOW())
        ");
        $stmt->execute([$adminUserId, $electionId]);
        return ['success' => true, 'message' => 'Admin assigned successfully'];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * Remove admin assignment from election (super_admin only)
 */
function removeAdminFromElection($pdo, $adminUserId, $electionId) {
    if (!isSuperAdmin()) {
        return ['success' => false, 'message' => 'Only super admins can remove admin assignments'];
    }
    
    try {
        $stmt = $pdo->prepare("
            DELETE FROM election_admins 
            WHERE admin_user_id = ? AND election_id = ?
        ");
        $stmt->execute([$adminUserId, $electionId]);
        return ['success' => true, 'message' => 'Admin assignment removed successfully'];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * Get admins assigned to an election
 */
function getElectionAdmins($pdo, $electionId) {
    $stmt = $pdo->prepare("
        SELECT u.id, u.user_id_hmac, u.username, u.username_arabic, ea.assigned_at
        FROM users u
        INNER JOIN election_admins ea ON u.id = ea.admin_user_id
        WHERE ea.election_id = ?
        ORDER BY u.username ASC
    ");
    $stmt->execute([$electionId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Send 403 Forbidden response and exit
 */
function sendForbidden($message = 'Unauthorized access') {
    http_response_code(403);
    if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => $message]);
    } else {
        echo '<h1>403 Forbidden</h1><p>' . htmlspecialchars($message) . '</p>';
    }
    exit();
}

/**
 * Require authentication, redirect to auth page if not logged in
 */
function requireAuth() {
    if (!isAuthenticated()) {
        header('Location: /auth.php');
        exit();
    }
}

/**
 * Require specific role(s)
 */
function requireRole($roles) {
    requireAuth();
    
    if (!is_array($roles)) {
        $roles = [$roles];
    }
    
    $currentRole = getCurrentUserRole();
    if (!in_array($currentRole, $roles)) {
        sendForbidden('You do not have permission to access this resource');
    }
}

/**
 * Require super admin role
 */
function requireSuperAdmin() {
    requireRole('super_admin');
}

/**
 * Require admin privileges (admin or super_admin)
 */
function requireAdminPrivileges() {
    requireRole(['admin', 'super_admin']);
}
