<?php
date_default_timezone_set("Europe/Moscow");

$input = file_get_contents("php://input");
$data = json_decode($input, true);
if (preg_match("/\.\d{13,}/", $input) || !checkDataValid($data)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid data format."]);
    exit;
}
$x = $data["x"];
$y = $data["y"];
$r = $data["r"];

$result = checkHit($x, $y, $r) ? "In" : "Out";
$execution_time = (microtime(true) - $_SERVER["REQUEST_TIME_FLOAT"]) * 1000;
$response = [
    "x" => $x,
    "y" => $y,
    "r" => $r,
    "timestamp" => date("H:i:s", $_SERVER["REQUEST_TIME"]),
    "execution_time" => round($execution_time, 2) . "ms",
    "result" => $result,
];
echo json_encode($response);

function checkDataValid($data)
{
    if (!is_array($data) || array_diff_key(array_flip(["x", "y", "r"]), $data))
        return false;
    $x = $data["x"];
    $y = $data["y"];
    $r = $data["r"];
    $x_valid = isset($x) && is_int($x) && -3 <= $x && $x <= 5;
    $y_valid = isset($y) && is_numeric($y) && -5 <= $y && $y <= 3;
    $r_valid = isset($r) && is_numeric($r) && in_array($r, array(1, 1.5, 2, 2.5, 3));
    return $x_valid && $y_valid && $r_valid;
}

function checkHit($x, $y, $r)
{
    $area1_hit = $x <= 0 && $y <= 0 && $x >= -$r / 2 && $y >= -$r;
    $area2_hit = $x <= 0 && $y >= 0 && $y < 2 * ($x + $r / 2);
    $area3_hit = $x >= 0 && $y >= 0 && $x ** 2 + $y ** 2 <= $r ** 2;
    return $area1_hit || $area2_hit || $area3_hit;
}
