<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$result = (new \Illuminate\Mail\Transport\SmtpTransport(
    new \Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport('smtp.resend.com', 465, true)
))->send(new \Symfony\Component\Mime\Email());
echo 'ok';
