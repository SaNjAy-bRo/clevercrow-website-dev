<?php
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

if (!is_array($data) || empty($data)) {
    $data = $_POST;
}

$formType = trim((string)($data['formType'] ?? 'Website Enquiry'));
$name = trim((string)($data['name'] ?? ''));
$phone = trim((string)($data['phone'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$message = trim((string)($data['message'] ?? ''));
$page = trim((string)($data['page'] ?? ''));
$services = $data['services'] ?? [];

if (is_string($services)) {
    $services = array_filter(array_map('trim', explode(',', $services)));
}

if ($name === '' || $phone === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Name and phone are required.']);
    exit;
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

$apiKey = getenv('RESEND_API_KEY') ?: '';
$toEmail = getenv('RESEND_TO') ?: (getenv('RESEND_TO_EMAIL') ?: 'kalyanapura.krishna@gmail.com');
$fromEmail = getenv('RESEND_FROM') ?: (getenv('RESEND_FROM_EMAIL') ?: 'onboarding@resend.dev');

if ($apiKey === '') {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server email configuration is missing.']);
    exit;
}

if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server email transport is unavailable.']);
    exit;
}

$servicesHtml = 'Not provided';
if (!empty($services) && is_array($services)) {
    $safeServices = array_map(static function ($item) {
        return htmlspecialchars((string)$item, ENT_QUOTES, 'UTF-8');
    }, $services);
    $servicesHtml = implode(', ', $safeServices);
}

$html = '
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
    <h2 style="margin: 0 0 14px;">New Lead Notification</h2>
    <p><strong>Form Type:</strong> ' . htmlspecialchars($formType, ENT_QUOTES, 'UTF-8') . '</p>
    <p><strong>Name:</strong> ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '</p>
    <p><strong>Phone:</strong> ' . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . '</p>
    <p><strong>Email:</strong> ' . ($email !== '' ? htmlspecialchars($email, ENT_QUOTES, 'UTF-8') : 'Not provided') . '</p>
    <p><strong>Services:</strong> ' . $servicesHtml . '</p>
    <p><strong>Message:</strong> ' . ($message !== '' ? nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) : 'Not provided') . '</p>
    <p><strong>Page:</strong> ' . ($page !== '' ? htmlspecialchars($page, ENT_QUOTES, 'UTF-8') : 'Not provided') . '</p>
    <p><strong>Submitted At:</strong> ' . date('Y-m-d H:i:s') . '</p>
    <p><strong>IP:</strong> ' . htmlspecialchars((string)($_SERVER['REMOTE_ADDR'] ?? ''), ENT_QUOTES, 'UTF-8') . '</p>
  </div>
';

$payload = [
    'from' => $fromEmail,
    'to' => [$toEmail],
    'subject' => 'New LP Enquiry - ' . $formType,
    'html' => $html
];

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 20
]);

$responseBody = curl_exec($ch);
$httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError !== '') {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Email request failed.']);
    exit;
}

if ($httpCode < 200 || $httpCode >= 300) {
    error_log('resend-form.php Resend failure: HTTP ' . $httpCode . ' Response: ' . (string)$responseBody);
    http_response_code(502);
    echo json_encode(['success' => false, 'message' => 'Resend rejected the request.', 'details' => $responseBody]);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Lead sent successfully',
    'redirectUrl' => 'https://clevercrow.in/thankyou/'
]);
