<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$p = DB::table('utilisateurs')->join('patients','utilisateurs.id_utilisateur','=','patients.id_utilisateur')->where('utilisateurs.id_utilisateur',1)->select('patients.date_naissance','patients.groupe_sanguin','patients.numero_cni')->first();
echo json_encode($p);
