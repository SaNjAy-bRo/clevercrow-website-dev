<?php

declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(403);
    echo 'Access denied.';
    exit;
}

$name = trim((string)($_POST['name'] ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$page = trim((string)($_POST['page'] ?? ''));
$formType = trim((string)($_POST['formType'] ?? 'Website Enquiry'));

if ($name === '' || $phone === '') {
    http_response_code(422);
    echo 'Please fill all required fields.';
    exit;
}

$resendApiKey = getenv('RESEND_API_KEY') ?: '';
$fromEmail = getenv('RESEND_FROM') ?: (getenv('RESEND_FROM_EMAIL') ?: 'onboarding@resend.dev');
$toEmail = getenv('RESEND_TO') ?: (getenv('RESEND_TO_EMAIL') ?: 'kalyanapura.krishna@gmail.com');
$subject = 'WD New Enquiry from CCS';

if ($resendApiKey === '') {
    http_response_code(500);
    echo 'Email service is not configured.';
    exit;
}

if (!function_exists('curl_init')) {
    http_response_code(500);
    echo 'Server email transport is unavailable.';
    exit;
}

$html = '
<html>
  <body style="font-family: Manrope, Arial, sans-serif; background:#f8fafc; padding:20px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; padding:20px; border:1px solid #e2e8f0;">
      <h2 style="margin:0 0 16px; color:#0f172a;">New Website Enquiry</h2>
      <p><strong>Form:</strong> ' . htmlspecialchars($formType, ENT_QUOTES, 'UTF-8') . '</p>
      <p><strong>Name:</strong> ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '</p>
      <p><strong>Phone:</strong> ' . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . '</p>
      <p><strong>Page URL:</strong> ' . htmlspecialchars($page, ENT_QUOTES, 'UTF-8') . '</p>
    </div>
  </body>
</html>';

$payload = [
    'from' => $fromEmail,
    'to' => [$toEmail],
    'subject' => $subject,
    'html' => $html,
];

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $resendApiKey,
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
    CURLOPT_TIMEOUT => 20,
]);

$response = curl_exec($ch);
$httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError !== '') {
    http_response_code(500);
    echo 'Unable to send email right now.';
    exit;
}

if ($httpCode >= 200 && $httpCode < 300) {
    header('Location: https://clevercrow.in/thankyou/');
    exit;
}

error_log('sendmail.php Resend failure: HTTP ' . $httpCode . ' Response: ' . (string)$response);

http_response_code(500);
echo 'Submission failed. Please try again later.';
