<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
Mail::raw('Test email MediNova', function($msg) {
    $msg->to('hadjerrennane@gmail.com')->subject('Test MediNova');
});
echo 'Envoye!';
