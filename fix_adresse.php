<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
DB::table('patients')->where('id_utilisateur',1)->update(['adresse'=>'Alger']);
echo 'OK';
