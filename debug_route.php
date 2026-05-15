<?php
// Simule exactement ce que fait la route /mes-rendez-vous
require '/var/www/html/vendor/autoload.php';
$app = require_once '/var/www/html/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

// Simule le token du patient
$token = 'b6c133e5d652ff955ed0cdfa8e55741bdeca4fe500063d39a9579b574b0384cd67a2339a272e6558';
$hashedToken = hash('sha256', $token);

$accessToken = DB::table('personal_access_tokens')
    ->where('token', $hashedToken)
    ->first();

echo "Access token tokenable_id: " . $accessToken->tokenable_id . "\n";

// Simule ce que le middleware set
$idUtilisateur = (int) $accessToken->tokenable_id;
echo "id_utilisateur: " . $idUtilisateur . "\n";

// Simule la query de la route
$rdvs = DB::table('rendez_vous as rv')
    ->leftJoin('disponibilites as d', 'rv.id_disponibilite', '=', 'd.id_disponibilite')
    ->leftJoin('utilisateurs as um', 'd.id_medecin', '=', 'um.id_utilisateur')
    ->leftJoin('medecins as m', 'um.id_utilisateur', '=', 'm.id_utilisateur')
    ->where('rv.id_patient', $idUtilisateur)
    ->orderBy('rv.date_rdv', 'desc')
    ->select('rv.*', 'um.nom as medecin_nom', 'um.prenom as medecin_prenom', 'm.specialite')
    ->get();

echo "RDVs found: " . count($rdvs) . "\n";
foreach($rdvs as $r) {
    echo "- RDV " . $r->id_rdv . " statut=" . $r->statut . "\n";
}
