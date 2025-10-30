<?php
require_once '../core/config.php';
function clean_input($data) {
    return trim(htmlspecialchars($data));
}

$action = clean_input($_POST['action']) ?? '';

if ($action === 'sendVote') {
    if (!isset($_POST['id_candidate']) || !isset($_POST['id_voter']) || !isset($_POST['id_position'])) {
        echo json_encode(['status' => 'error', 'message' => 'missing parameters']);
        exit;
    }

    $data = [
        'candidateId' => clean_input($_POST['id_candidate']),
        'voterId' => clean_input($_POST['id_voter']),
        'positionId' => clean_input($_POST['id_position'])
    ];

    $ch = curl_init("http://localhost:3000/api/receive-vote");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $response = curl_exec($ch);

    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        echo json_encode(['status' => 'error', 'message' => $error]);
        exit;
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo $response;
} else if ($action === 'getResults') {
    $data = [];

    $ch = curl_init("http://localhost:3000/api/get-votes");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $response = curl_exec($ch);

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $res = json_decode($response, true);
    $votes = $res['data'];

    $votesByPositions = [];
    foreach($votes as $vote) {
        $pos = $vote['positionId'] ?? null;
        $can = $vote['candidateId'] ?? null;

        if (!isset($votesByPositions[$pos])) {
            $votesByPositions[$pos] = [];
        }

        if (!isset($votesByPositions[$pos][$can])) {
            $votesByPositions[$pos][$can] = 0;
        }

        $votesByPositions[$pos][$can]++;
    }

    $percentagesByPositions = [];
    foreach ($votesByPositions as $pos => $candidates) {
        $totalVotes = array_sum($candidates);
        foreach ($candidates as $cand => $count) {
            $percentagesByPositions[$pos][$cand] = ($count / $totalVotes) * 100;
        }
    }
    
    echo json_encode($percentagesByPositions);
    // echo json_encode($votes);
} else {
    echo json_encode(['status' => 'error', 'message' => 'invalid action']);
}

