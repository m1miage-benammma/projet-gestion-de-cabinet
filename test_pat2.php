<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$idUtilisateur = 1;
$patient = DB::table('utilisateurs as u')
    ->join('patients as p', 'p.id_utilisateur', '=', 'u.id_utilisateur')
    ->where('u.id_utilisateur', $idUtilisateur)
    ->select('u.nom','u.prenom','u.email','u.telephone','u.genre',
             'p.date_naissance','p.groupe_sanguin','p.adresse',
             'p.allergies','p.antecedents_medicaux')
    ->first();
echo json_encode($patient);
