<?php
// Fix direct - remplace les routes confirmer/patientArrive/terminer
// par des closures qui font le UPDATE directement en DB

$file = 'routes/api.php';
$content = file_get_contents($file);

// Remplace les routes PATCH par des closures directes
$old = "Route::patch('/rendez-vous/{id}/confirmer',      [RendezVousController::class, 'confirmer']);";
$new = "Route::patch('/rendez-vous/{id}/confirmer', function(int \$id) {
        \$rdv = DB::table('rendez_vous')->where('id_rdv', \$id)->first();
        if (!\$rdv) return response()->json(['message' => 'RDV introuvable'], 404);
        if (\$rdv->statut !== 'en_attente') return response()->json(['message' => 'Statut invalide'], 400);
        DB::table('rendez_vous')->where('id_rdv', \$id)->update(['statut' => 'confirme', 'updated_at' => now()]);
        DB::table('notifications')->insert(['id_utilisateur' => \$rdv->id_patient, 'message' => 'Votre RDV a été confirmé.', 'type' => 'rdv_confirme', 'lu' => false, 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['id_rdv' => \$id, 'statut' => 'confirme', 'message' => 'Confirmé.']);
    });";

$content = str_replace($old, $new, $content);

$old2 = "Route::patch('/rendez-vous/{id}/patient-arrive', [RendezVousController::class, 'patientArrive']);";
$new2 = "Route::patch('/rendez-vous/{id}/patient-arrive', function(int \$id) {
        \$rdv = DB::table('rendez_vous')->where('id_rdv', \$id)->first();
        if (!\$rdv) return response()->json(['message' => 'RDV introuvable'], 404);
        DB::table('rendez_vous')->where('id_rdv', \$id)->update(['statut' => 'patient_arrive', 'updated_at' => now()]);
        return response()->json(['id_rdv' => \$id, 'statut' => 'patient_arrive', 'message' => 'Patient arrivé.']);
    });";

$content = str_replace($old2, $new2, $content);

$old3 = "Route::patch('/rendez-vous/{id}/terminer',       [RendezVousController::class, 'terminer']);";
$new3 = "Route::patch('/rendez-vous/{id}/terminer', function(int \$id) {
        DB::table('rendez_vous')->where('id_rdv', \$id)->update(['statut' => 'termine', 'updated_at' => now()]);
        return response()->json(['id_rdv' => \$id, 'statut' => 'termine', 'message' => 'Terminé.']);
    });";

$content = str_replace($old3, $new3, $content);

$old4 = "Route::patch('/rendez-vous/{id}/annuler',        [RendezVousController::class, 'annuler']);";
$new4 = "Route::patch('/rendez-vous/{id}/annuler', function(int \$id) {
        \$rdv = DB::table('rendez_vous')->where('id_rdv', \$id)->first();
        if (!\$rdv) return response()->json(['message' => 'RDV introuvable'], 404);
        DB::table('rendez_vous')->where('id_rdv', \$id)->update(['statut' => 'annule', 'updated_at' => now()]);
        DB::table('notifications')->insert(['id_utilisateur' => \$rdv->id_patient, 'message' => 'Votre RDV a été annulé.', 'type' => 'rdv_annule', 'lu' => false, 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['id_rdv' => \$id, 'statut' => 'annule', 'message' => 'Annulé.']);
    });";

$content = str_replace($old4, $new4, $content);

file_put_contents($file, $content);
echo "OK - routes fixes\n";
