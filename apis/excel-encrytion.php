<?php
require_once 'crypto.php';
require_once '../core/config.php';


header('Content-Type: application/json');
$json = json_decode(file_get_contents("php://input"), true);

$id_election = $json['electionId'];
$data = $json['jsonData'];


try {
    foreach($data as $d) {
        $id_user_hmac = hmac_national_id($d['ID'], $HMAC_KEY);
        $nationality_hmac = hmac_national_id($d['Nationality'], $HMAC_KEY);

        $stmt = $pdo->prepare("INSERT IGNORE INTO `users`(`user_id_hmac`, `nationality_hmac`, `created_at`) VALUES (?, ?, NOW())");
        $stmt->execute([$id_user_hmac, $nationality_hmac]);

        $stmt = $pdo->prepare("INSERT IGNORE INTO `users_election`(`user_id_hmac`, `id_election`) VALUES (?, ?)");
        $stmt->execute([$id_user_hmac, $id_election]);
    }
    echo json_encode(['type' => 'success', 'message' => 'list_was_add_successefuly']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['type' => 'error', 'message' => $e]);
}




// echo json_encode($data);