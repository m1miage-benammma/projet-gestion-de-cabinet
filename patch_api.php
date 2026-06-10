<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$content = file_get_contents('/var/www/html/routes/api.php');
$old = "        return response()->json($dossier);
    });";
$new = "        $patient = DB::table('utilisateurs as u')
            ->join('patients as p', 'p.id_utilisateur', '=', 'u.id_utilisateur')
            ->where('u.id_utilisateur', $idUtilisateur)
            ->select('u.nom','u.prenom','u.email','u.telephone','u.genre',
                     'p.date_naissance','p.groupe_sanguin','p.adresse',
                     'p.allergies','p.antecedents_medicaux')
            ->first();
        $result = (array) $dossier;
        $result['patient'] = $patient;
        return response()->json($result);
    });";
$new_content = str_replace($old, $new, $content);
if ($new_content !== $content) {
    file_put_contents('/var/www/html/routes/api.php', $new_content);
    echo 'OK - api.php updated';
} else {
    echo 'NOT FOUND';
}
