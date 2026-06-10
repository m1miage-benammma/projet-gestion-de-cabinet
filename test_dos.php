<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$result = DB::table('dossiers_medicaux')->where('id_patient',1)->first();
echo json_encode($result);
