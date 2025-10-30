<?php
require_once '../core/config.php';
require_once 'auth-helpers.php';

header('Content-Type: application/json');


$action = $_GET['action'] ?? $_POST['action'];

switch ($action){
    case 'getAllPositions' :
        $stmt = $pdo->prepare("SELECT * FROM `position`");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case 'getPositionByElection' :
        $id_election = $_GET['id_election'];

        $stmt = $pdo->prepare("SELECT * FROM `position` WHERE id_election = ?");
        $stmt->execute([$id_election]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case 'getCandidatesByPosition' :
        $id_position = $_GET['id_position'];

        $stmt = $pdo->prepare("SELECT * FROM `candidates` WHERE id_position = ?");
        $stmt->execute([$id_position]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case 'getPosition':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(["error" => "id is required"]);
            break;
        }
        $stmt = $pdo->prepare("SELECT * FROM `position` WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: new stdClass());
        break;
    case 'getElection':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(["error" => "id is required"]);
            break;
        }
        $stmt = $pdo->prepare("
            SELECT e.*, ea.admin_user_id, 
            p.en_name as position_en_name, 
            p.fr_name as position_fr_name, 
            p.ar_name as position_ar_name 
            FROM `election` e 
            LEFT JOIN election_admins ea ON e.id = ea.election_id 
            LEFT JOIN position p ON e.id = p.id_election 
            WHERE e.id = ?
        ");
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: new stdClass());
        break;
    case 'getCandidatesByElection':
        $id_election = $_GET['id_election'] ?? null;
        if (!$id_election) {
            echo json_encode(["error" => "id_election is required"]);
            break;
        }
        $stmt = $pdo->prepare("SELECT c.*, p.en_name as position_name, p.fr_name as position_name_fr, p.ar_name as position_name_ar FROM `candidates` c JOIN `position` p ON c.id_position = p.id WHERE p.id_election = ? ORDER BY p.id, c.id");
        $stmt->execute([$id_election]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case 'getActiveElections':
        $id_user_hmac = getCurrentUserId();
        // Get all elections with status = 1 (active)
        $stmt = $pdo->prepare("SELECT * FROM `election` WHERE status = 1 AND id IN (SELECT id_election FROM `users_election` WHERE user_id_hmac = ?) ORDER BY start_date DESC");
        $stmt->execute([$id_user_hmac]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case 'getAllElections':
        $id_admin = getCurrentUserDbId($pdo);
        // Get all elections (for admin results page)
        $stmt = $pdo->prepare("SELECT * FROM `election` WHERE id IN (SELECT election_id FROM election_admins WHERE admin_user_id = ?) ORDER BY year DESC, start_date DESC");
        $stmt->execute([$id_admin]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case 'getElectionAdmins':
        $election_id = $_GET['election_id'] ?? null;
        if (!$election_id) {
            echo json_encode(["error" => "election_id is required"]);
            break;
        }
        $stmt = $pdo->prepare("SELECT admin_user_id FROM election_admins WHERE election_id = ?");
        $stmt->execute([$election_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    case '':
        break;
    default:
        // echo json_encode(["error" => "Unknown action"]);
        break;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    function clean_input($data) {
        return trim(htmlspecialchars($data, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
    }
    function scan_files_allow($file, $type, $name) {
        $filename = basename($file['name']);
        $allowed = ['jpg', 'jpeg', 'png'];
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (!in_array($ext, $allowed)) {
            echo json_encode(["error" => "Image format is not valid"]);
            exit();
        }

        $candidates_dir =  'assets\images\\' . $type . '\\';

        if (!is_dir($candidates_dir)) {
            mkdir($candidates_dir, 0755, true);
        }

        $new_file_name = $name . '_' . uniqid() . '_' . time() . '.' . $ext;
        $destination = $candidates_dir . $new_file_name;

        if (!move_uploaded_file($file['tmp_name'], '..\\'.$destination)) {
            echo json_encode(["error" => "Failed to move uploaded file"]);
            exit();
        }

        return $destination;
    }


    switch ($action){
        case 'stopElection' :
            // Only super_admin can stop elections
            if (!isSuperAdmin()) {
                sendForbidden('Only super admins can stop elections');
            }
            
            $id_Election = clean_input($_POST['id_Election']);

            try {
                $stmt = $pdo->prepare("UPDATE `election` SET `status`= 0 WHERE id = ?");
                $stmt->execute([$id_Election]);
                echo json_encode(["success" => "Election Was Stoped successfully"]);
            } catch (PDOException $e) {
                echo json_encode(["error" => $e->getMessage()]);
            }
            break;
        case 'addElection' :
            // Only super_admin can create elections
            if (!isSuperAdmin()) {
                sendForbidden('Only super admins can create elections');
            }
            
            $ar_organizer = clean_input($_POST['ar_organizer']);
            $en_organizer = clean_input($_POST['en_organizer']);
            $fr_organizer = clean_input($_POST['fr_organizer']);
            $year = clean_input($_POST['year']);
            $start_date = clean_input($_POST['start_date']);
            $end_date = clean_input($_POST['end_date']);
            $status = isset($_POST['status']) ? (int)$_POST['status'] : 1;
            $election_type = clean_input($_POST['election_type'] ?? '');
            $admin_user_ids = isset($_POST['admin_user_ids']) ? $_POST['admin_user_ids'] : '';
            $created_by = getCurrentUserDbId($pdo);

            try {
                $stmt = $pdo->prepare("INSERT INTO `election`(`en_organizer`, `fr_organizer`, `ar_organizer`, `year`, `start_date`, `end_date`, `status`, `election_type`, `created_by`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$en_organizer, $fr_organizer, $ar_organizer, $year, $start_date, $end_date, $status, $election_type, $created_by]);
                
                $electionId = $pdo->lastInsertId();
                
                // Assign admins if specified (comma-separated IDs)
                if (!empty($admin_user_ids)) {
                    $adminIds = array_filter(array_map('trim', explode(',', $admin_user_ids)));
                    $assignStmt = $pdo->prepare("INSERT INTO election_admins (admin_user_id, election_id) VALUES (?, ?)");
                    foreach ($adminIds as $adminId) {
                        if (is_numeric($adminId)) {
                            $assignStmt->execute([(int)$adminId, $electionId]);
                        }
                    }
                }
                
                // Create position for this election if position data is provided
                $position_en = clean_input($_POST['position_en_name'] ?? '');
                $position_fr = clean_input($_POST['position_fr_name'] ?? '');
                $position_ar = clean_input($_POST['position_ar_name'] ?? '');
                
                if ($position_en && $position_fr && $position_ar) {
                    $posStmt = $pdo->prepare("INSERT INTO `position`(`en_name`, `fr_name`, `ar_name`, `id_election`, `created_by`) VALUES (?, ?, ?, ?, ?)");
                    $posStmt->execute([$position_en, $position_fr, $position_ar, $electionId, $created_by]);
                }
                
                echo json_encode(["success" => "Election added successfully", "id" => $electionId]);
            } catch (PDOException $e) {
                echo json_encode(["error" => $e->getMessage()]);
            }
            break;
        case 'editElection':
            // Only super_admin can edit elections
            if (!isSuperAdmin()) {
                sendForbidden('Only super admins can edit elections');
            }
            
            $id = (int)$_POST['id'];
            $ar_organizer = clean_input($_POST['ar_organizer']);
            $en_organizer = clean_input($_POST['en_organizer']);
            $fr_organizer = clean_input($_POST['fr_organizer']);
            $year = clean_input($_POST['year']);
            $start_date = clean_input($_POST['start_date']);
            $end_date = clean_input($_POST['end_date']);
            $status = isset($_POST['status']) ? (int)$_POST['status'] : 1;
            $election_type = clean_input($_POST['election_type'] ?? '');
            $admin_user_ids = isset($_POST['admin_user_ids']) ? $_POST['admin_user_ids'] : '';

            try {
                $stmt = $pdo->prepare("UPDATE `election` SET `en_organizer`=?, `fr_organizer`=?, `ar_organizer`=?, `year`=?, `start_date`=?, `end_date`=?, `status`=?, `election_type`=? WHERE id=?");
                $stmt->execute([$en_organizer, $fr_organizer, $ar_organizer, $year, $start_date, $end_date, $status, $election_type, $id]);
                
                // Update admin assignments if specified (comma-separated IDs)
                // Remove existing assignments
                $delStmt = $pdo->prepare("DELETE FROM election_admins WHERE election_id = ?");
                $delStmt->execute([$id]);
                
                // Add new assignments
                if (!empty($admin_user_ids)) {
                    $adminIds = array_filter(array_map('trim', explode(',', $admin_user_ids)));
                    $assignStmt = $pdo->prepare("INSERT INTO election_admins (admin_user_id, election_id) VALUES (?, ?)");
                    foreach ($adminIds as $adminId) {
                        if (is_numeric($adminId)) {
                            $assignStmt->execute([(int)$adminId, $id]);
                        }
                    }
                }
                
                // Update position for this election if position data is provided
                $position_en = clean_input($_POST['position_en_name'] ?? '');
                $position_fr = clean_input($_POST['position_fr_name'] ?? '');
                $position_ar = clean_input($_POST['position_ar_name'] ?? '');
                
                if ($position_en && $position_fr && $position_ar) {
                    // Check if position already exists for this election
                    $checkPos = $pdo->prepare("SELECT id FROM position WHERE id_election = ?");
                    $checkPos->execute([$id]);
                    $existingPos = $checkPos->fetch(PDO::FETCH_ASSOC);
                    
                    if ($existingPos) {
                        // Update existing position
                        $updatePos = $pdo->prepare("UPDATE position SET en_name=?, fr_name=?, ar_name=? WHERE id_election=?");
                        $updatePos->execute([$position_en, $position_fr, $position_ar, $id]);
                    } else {
                        // Create new position for this election
                        $insertPos = $pdo->prepare("INSERT INTO position (en_name, fr_name, ar_name, id_election, created_by) VALUES (?, ?, ?, ?, ?)");
                        $insertPos->execute([$position_en, $position_fr, $position_ar, $id, getCurrentUserDbId($pdo)]);
                    }
                }
                
                echo json_encode(["success" => "Election updated successfully", "id" => $id]);
            } catch (PDOException $e) {
                echo json_encode(["error" => $e->getMessage()]);
            }
            break;
        case 'editElectionConfig':
            // Admin can edit election type and position for their assigned elections
            if (!hasAdminPrivileges()) {
                sendForbidden('Admin privileges required');
            }
            
            $id = (int)$_POST['id'];
            
            // Check if admin can manage this election
            if (!canEditElection($pdo, $id)) {
                sendForbidden('You do not have permission to manage this election');
            }
            
            $election_type = clean_input($_POST['election_type'] ?? '');
            
            try {
                // Update election type
                if ($election_type) {
                    $stmt = $pdo->prepare("UPDATE `election` SET `election_type`=? WHERE id=?");
                    $stmt->execute([$election_type, $id]);
                }
                
                // Update position for this election if position data is provided
                $position_en = clean_input($_POST['position_en_name'] ?? '');
                $position_fr = clean_input($_POST['position_fr_name'] ?? '');
                $position_ar = clean_input($_POST['position_ar_name'] ?? '');
                
                if ($position_en && $position_fr && $position_ar) {
                    // Check if position already exists for this election
                    $checkPos = $pdo->prepare("SELECT id FROM position WHERE id_election = ?");
                    $checkPos->execute([$id]);
                    $existingPos = $checkPos->fetch(PDO::FETCH_ASSOC);
                    
                    if ($existingPos) {
                        // Update existing position
                        $updatePos = $pdo->prepare("UPDATE position SET en_name=?, fr_name=?, ar_name=? WHERE id_election=?");
                        $updatePos->execute([$position_en, $position_fr, $position_ar, $id]);
                    } else {
                        // Create new position for this election
                        $insertPos = $pdo->prepare("INSERT INTO position (en_name, fr_name, ar_name, id_election, created_by) VALUES (?, ?, ?, ?, ?)");
                        $insertPos->execute([$position_en, $position_fr, $position_ar, $id, getCurrentUserDbId($pdo)]);
                    }
                }
                
                echo json_encode(["success" => "Election configuration updated successfully", "id" => $id]);
            } catch (PDOException $e) {
                echo json_encode(["error" => $e->getMessage()]);
            }
            break;
        case 'addPosition' :
            // Check authorization
            if (!hasAdminPrivileges()) {
                sendForbidden('Admin privileges required');
            }
            
            $ar_name = clean_input($_POST['ar_name']);
            $en_name = clean_input($_POST['en_name']);
            $fr_name = clean_input($_POST['fr_name']);
            $id_election = clean_input($_POST['id_election'] ?? '0');
            
            // Convert empty string or '0' to NULL for template positions
            if ($id_election === '' || $id_election === '0' || $id_election === 0) {
                $id_election = null;
            } else {
                $id_election = (int)$id_election;
            }
            
            // For actual elections (not templates), check if admin can manage this election
            if ($id_election !== null && !canEditElection($pdo, $id_election)) {
                sendForbidden('You do not have permission to manage this election');
            }
            
            // For template positions (id_election = NULL), only super_admin can create them
            if ($id_election === null && !isSuperAdmin()) {
                sendForbidden('Only super admins can create template positions');
            }
            
            $created_by = getCurrentUserDbId($pdo);

            try {
                // Check for duplicate position name
                if ($id_election === null) {
                    // For templates, check if template with same name exists
                    $check = $pdo->prepare("SELECT id FROM `position` WHERE (id_election IS NULL OR id_election = 0) AND en_name = ?");
                    $check->execute([$en_name]);
                } else {
                    // For election positions, check within that election
                    $check = $pdo->prepare("SELECT id FROM `position` WHERE id_election = ? AND en_name = ?");
                    $check->execute([$id_election, $en_name]);
                }
                $existing = $check->fetch(PDO::FETCH_ASSOC);

                if ($existing) {
                    http_response_code(409);
                    echo json_encode(["error" => "Position with that name already exists"]);
                } else {
                    $ins = $pdo->prepare("INSERT INTO `position`(`fr_name`, `en_name`, `ar_name`, `id_election`, `created_by`) VALUES (?, ?, ?, ?, ?)");
                    $ins->execute([$fr_name, $en_name, $ar_name, $id_election, $created_by]);
                    echo json_encode(["success" => "Position added successfully", "id" => $pdo->lastInsertId()]);
                }
            } catch (PDOException $e) {
                // Handle unique constraint violation
                if ($e->getCode() == 23000) {
                    http_response_code(409);
                    echo json_encode(["error" => "Position with that name already exists"]);
                } else {
                    echo json_encode(["error" => $e->getMessage()]);
                }
            }
            break;
        case 'deletePosition':
            // Check authorization
            if (!hasAdminPrivileges()) {
                sendForbidden('Admin privileges required');
            }
            
            $id = isset($_POST['id']) ? (int)$_POST['id'] : null;
            $id_election = isset($_POST['id_election']) ? (int)$_POST['id_election'] : null;

            try {
                if (!$id) {
                    if (!$id_election) {
                        echo json_encode(["error" => "id or id_election is required"]);
                        break;
                    }
                    $stmt = $pdo->prepare("SELECT id FROM `position` WHERE id_election = ? LIMIT 1");
                    $stmt->execute([$id_election]);
                    $row = $stmt->fetch(PDO::FETCH_ASSOC);
                    if (!$row) {
                        echo json_encode(["success" => "No position to delete"]);
                        break;
                    }
                    $id = (int)$row['id'];
                }
                
                // Get election ID to check permission
                $electionId = getElectionIdFromPosition($pdo, $id);
                if (!$electionId || !canEditElection($pdo, $electionId)) {
                    sendForbidden('You do not have permission to manage this election');
                }

                // Detach candidates referencing this position
                $stmt = $pdo->prepare("UPDATE `candidates` SET id_position = NULL WHERE id_position = ?");
                $stmt->execute([$id]);

                // Delete the position
                $stmt = $pdo->prepare("DELETE FROM `position` WHERE id = ?");
                $stmt->execute([$id]);

                echo json_encode(["success" => "Position deleted successfully"]);
            } catch (PDOException $e) {
                echo json_encode(["error" => $e->getMessage()]);
            }
            break;
        case 'addCandidate' :
            // Check authorization
            if (!hasAdminPrivileges()) {
                sendForbidden('Admin privileges required');
            }
            
            $ar_name = clean_input($_POST['ar_name']);
            $name = clean_input($_POST['name']);
            $ar_description = clean_input($_POST['ar_description']);
            $fr_description = clean_input($_POST['fr_description']);
            $en_description = clean_input($_POST['en_description']);
            $supporting_party = clean_input($_POST['supporting_party']);
            $id_position = (int) $_POST['id_position'];
            $nominate_at = date('Y-m-d');
            
            // Validate position exists and get election ID
            $electionId = getElectionIdFromPosition($pdo, $id_position);
            if (!$electionId) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid position ID"]);
                break;
            }
            
            // Check if user can manage candidates for this election
            if (!canEditElection($pdo, $electionId)) {
                sendForbidden('You do not have permission to manage candidates for this election');
            }
            
            $created_by = getCurrentUserDbId($pdo);

            $photo_candidate_path = scan_files_allow($_FILES['photo_candidate'], 'candidates', $name);
            $logo_supporting_path = scan_files_allow($_FILES['logo_supporting'], 'supportings', $name);

            try {
                $stmt = $pdo->prepare("INSERT INTO `candidates`(`name`, `ar_name`, `photo_path`, `fr_description`, `en_description`, `ar_description`, `nominated_at`, `Supporting_party`, `path_supporting_party_logo`, `id_position`, `created_by`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$name, $ar_name, $photo_candidate_path, $fr_description, $en_description, $ar_description, $nominate_at, $supporting_party, $logo_supporting_path, $id_position, $created_by]);
                echo json_encode(["success" => "Candidate added successfully", "id" => $pdo->lastInsertId()]);
            } catch (PDOException $e) {
                echo json_encode(["error" => $e->getMessage()]);
            }
            break;
        case 'publishResults' :
            // Super_admin can publish any election, admin can only publish assigned elections
            $id_Election = clean_input($_POST['id_election']);
            
            if (!isSuperAdmin() && !canEditElection($pdo, $id_Election)) {
                sendForbidden('You do not have permission to publish results for this election');
            }

            try {
                $stmt = $pdo->prepare("UPDATE `election` SET `results`= 'publish' WHERE id = ?");
                $stmt->execute([$id_Election]);
                echo json_encode(["success" => "Election Results Was Publish successfully"]);
            } catch (PDOException $e) {
                echo json_encode(["error" => $e->getMessage()]);
            }
            break;
        case 'stopPublishingResults' :
            // Super_admin can unpublish any election, admin can only unpublish assigned elections
            $id_Election = clean_input($_POST['id_election']);
            
            if (!isSuperAdmin() && !canEditElection($pdo, $id_Election)) {
                sendForbidden('You do not have permission to unpublish results for this election');
            }

            try {
                $stmt = $pdo->prepare("UPDATE `election` SET `results`= 'nopublish' WHERE id = ?");
                $stmt->execute([$id_Election]);
                echo json_encode(["success" => "Election Results Was Publish successfully"]);
            } catch (PDOException $e) {
                echo json_encode(["error" => $e->getMessage()]);
            }
            break;
        case 'createPosition':
            $ar_name = clean_input($_POST['ar_name']);
            $fr_name = clean_input($_POST['fr_name']);
            $en_name = clean_input($_POST['en_name']);
            $id_election = clean_input($_POST['id']);
            $id_admin = getCurrentUserDbId($pdo);

            $stmt = $pdo->prepare("INSERT INTO `position`(`fr_name`, `en_name`, `ar_name`, `id_election`, `created_by`, `created_at`) VALUES (?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$fr_name, $en_name, $ar_name, $id_election, $id_admin]);
            echo json_encode(["success" => "Position Add Successfuly"]);
            break;
        default:
            echo json_encode(["error" => "Unknown action"]);
            break;
    }
} 