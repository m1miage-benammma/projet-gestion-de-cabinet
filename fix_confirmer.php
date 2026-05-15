<?php
$file = 'routes/api.php';
$content = file_get_contents($file);

$newRoute = '    Route::patch(\'/rendez-vous/{id}/confirmer\', function(int $id) {
        $rdv = DB::table(\'rendez_vous\')->where(\'id_rdv\', $id)->first();
        if (!$rdv) return response()->json([\'message\' => \'RDV introuvable\'], 404);
        if ($rdv->statut !== \'en_attente\') return response()->json([\'message\' => \'Statut invalide: \'.$rdv->statut], 400);
        DB::table(\'rendez_vous\')->where(\'id_rdv\', $id)->update([\'statut\' => \'confirme\', \'updated_at\' => now()]);
        DB::table(\'notifications\')->insert([\'id_utilisateur\' => $rdv->id_patient, \'message\' => \'Votre RDV a ete confirme.\', \'type\' => \'rdv_confirme\', \'lu\' => false, \'created_at\' => now(), \'updated_at\' => now()]);
        return response()->json([\'statut\' => \'confirme\', \'message\' => \'Confirme.\']);
    });
';

// Insert before annuler route
$content = str_replace(
    "    Route::patch('/rendez-vous/{id}/annuler'",
    $newRoute . "    Route::patch('/rendez-vous/{id}/annuler'",
    $content
);

file_put_contents($file, $content);
echo "OK\n";

// Verify
$lines = file($file);
foreach($lines as $i => $line) {
    if (strpos($line, 'confirmer') !== false || strpos($line, 'annuler') !== false || strpos($line, 'patient-arrive') !== false) {
        echo ($i+1).": ".$line;
    }
}
