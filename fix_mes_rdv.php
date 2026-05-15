<?php
$file = 'routes/api.php';
$content = file_get_contents($file);

$old = "    Route::get('/mes-rendez-vous', function (Request \$r) {
        \$idUtilisateur = (int) \$r->attributes->get('id_utilisateur');";

$new = "    Route::get('/mes-rendez-vous', function (Request \$r) {
        \$authUser = \$r->attributes->get('auth_user');
        \$idUtilisateur = (int) (\$authUser->id_utilisateur ?? \$r->attributes->get('id_utilisateur') ?? 0);";

$content = str_replace($old, $new, $content);

// Fix aussi rendez-vous-jour
$old2 = "    Route::get('/rendez-vous-jour', function () {";
// This one doesn't use id so no fix needed

file_put_contents($file, $content);

// Verify fix
if (strpos(file_get_contents($file), 'auth_user') !== false) {
    echo "OK - fix appliqué\n";
} else {
    echo "ERREUR - fix non appliqué\n";
    // Try alternative fix
    $content = file_get_contents($file);
    $content = preg_replace(
        "/(\\/mes-rendez-vous.*?function.*?Request \\\$r\) \{)\s*\\\$idUtilisateur = \(int\) \\\$r->attributes->get\('id_utilisateur'\);/s",
        "$1\n        \$authUser = \$r->attributes->get('auth_user');\n        \$idUtilisateur = (int) (\$authUser->id_utilisateur ?? 0);",
        $content
    );
    file_put_contents($file, $content);
    echo "Alternative fix appliqué\n";
}
