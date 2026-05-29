<?php
$file = 'app/Modules/RendezVous/Controller/RendezVousController.php';
$content = file_get_contents($file);

// Fix confirmer - replace getIdRdv/getStatut with toArray
$content = str_replace(
    "return response()->json(['id_rdv' => \$result->getIdRdv(), 'statut' => \$result->getStatut(), 'message' => 'Rendez-vous confirmé.']);",
    "return response()->json(\$result->toArray());",
    $content
);

// Fix annuler
$content = str_replace(
    "return response()->json(['id_rdv' => \$result->getIdRdv(), 'statut' => \$result->getStatut(), 'message' => 'Rendez-vous annulé.']);",
    "return response()->json(\$result->toArray());",
    $content
);

// Fix patientArrive
$content = str_replace(
    "return response()->json(['id_rdv' => \$result->getIdRdv(), 'statut' => \$result->getStatut(), 'message' => 'Patient arrivé.']);",
    "return response()->json(\$result->toArray());",
    $content
);

// Fix terminer
$content = str_replace(
    "return response()->json(['id_rdv' => \$result->getIdRdv(), 'statut' => \$result->getStatut(), 'message' => 'Consultation terminée.']);",
    "return response()->json(\$result->toArray());",
    $content
);

file_put_contents($file, $content);
echo "OK\n";
echo "Verify:\n";
echo shell_exec("grep -n 'getIdRdv\|getStatut\|toArray' $file");
