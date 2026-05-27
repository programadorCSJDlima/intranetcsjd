<?php

header('Content-Type: application/json; charset=utf-8');

function respond($statusCode, $payload)
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function firstExistingPath(array $candidates)
{
    foreach ($candidates as $candidate) {
        if (!$candidate) {
            continue;
        }

        $normalized = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $candidate);
        if (file_exists($normalized)) {
            $real = realpath($normalized);
            return $real !== false ? $real : $normalized;
        }
    }

    return null;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, [
        'success' => false,
        'message' => 'Metodo no permitido.',
    ]);
}

$popupMap = [
    'cumpleanios' => [
        'fileName' => 'cumpleanios-popup.jpg',
        'configFile' => 'cumpleanios.json',
    ],
    'menu' => [
        'fileName' => 'menu-popup.jpg',
        'configFile' => 'menu.json',
    ],
];

$popupKey = trim($_POST['popupKey'] ?? '');
if (!isset($popupMap[$popupKey])) {
    respond(400, [
        'success' => false,
        'message' => 'Tipo de popup no valido.',
    ]);
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    respond(400, [
        'success' => false,
        'message' => 'No se recibio ninguna imagen valida.',
    ]);
}

$fileInfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($fileInfo, $_FILES['image']['tmp_name']);
finfo_close($fileInfo);

if ($mimeType !== 'image/jpeg') {
    respond(400, [
        'success' => false,
        'message' => 'Formato no permitido. Usa solo JPG o JPEG.',
    ]);
}

$host = $_SERVER['HTTP_HOST'] ?? '10.10.0.155';
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$link = trim($_POST['modalLink'] ?? '');

$appRoot = realpath(dirname(__DIR__)) ?: dirname(__DIR__);
$documentRoot = isset($_SERVER['DOCUMENT_ROOT']) ? realpath($_SERVER['DOCUMENT_ROOT']) : false;

$photosDir = firstExistingPath([
    $documentRoot ? $documentRoot . DIRECTORY_SEPARATOR . 'intranetphotos' : null,
    dirname($appRoot) . DIRECTORY_SEPARATOR . 'intranetphotos',
    $appRoot . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'intranetphotos',
]);

if ($photosDir === null) {
    $photosDir = ($documentRoot ?: dirname($appRoot)) . DIRECTORY_SEPARATOR . 'intranetphotos';
}

$configDir = firstExistingPath([
    $appRoot . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'publicacion',
    $documentRoot
        ? $documentRoot . DIRECTORY_SEPARATOR . 'intranet' . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'publicacion'
        : null,
]);

if ($configDir === null) {
    $configDir = $appRoot . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'publicacion';
}

$targetFileName = $popupMap[$popupKey]['fileName'];
$configFileName = $popupMap[$popupKey]['configFile'];
$targetPath = $photosDir . DIRECTORY_SEPARATOR . $targetFileName;
$configPath = $configDir . DIRECTORY_SEPARATOR . $configFileName;

if (!is_dir($photosDir) && !mkdir($photosDir, 0777, true) && !is_dir($photosDir)) {
    respond(500, [
        'success' => false,
        'message' => 'No se pudo crear la carpeta de imagenes.',
    ]);
}

if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
    respond(500, [
        'success' => false,
        'message' => 'No se pudo guardar la imagen en el servidor.',
        'debug' => [
            'targetPath' => $targetPath,
            'photosDirWritable' => is_writable($photosDir),
        ],
    ]);
}

if (!is_dir($configDir) && !mkdir($configDir, 0777, true) && !is_dir($configDir)) {
    respond(500, [
        'success' => false,
        'message' => 'No se pudo preparar la carpeta de configuracion.',
    ]);
}

$timestamp = time();
$modalImage = sprintf('%s://%s/intranetphotos/%s?v=%d', $scheme, $host, $targetFileName, $timestamp);
$configPayload = [
    'modalImage' => $modalImage,
    'modalLink' => $link,
];

if (file_put_contents(
    $configPath,
    json_encode($configPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
) === false) {
    respond(500, [
        'success' => false,
        'message' => 'No se pudo actualizar la configuracion del popup.',
        'debug' => [
            'configPath' => $configPath,
            'configDirWritable' => is_writable($configDir),
        ],
    ]);
}

respond(200, [
    'success' => true,
    'message' => 'Popup actualizado correctamente.',
    'modalImage' => $modalImage,
    'modalLink' => $link,
]);
