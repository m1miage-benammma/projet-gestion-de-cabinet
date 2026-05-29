<?php
$file = 'routes/api.php';
$content = file_get_contents($file);

// Fix ligne 127 - remplace get('id_utilisateur') par auth_user
$content = str_replace(
    "\$idUtilisateur = (int) \$r->attributes->get('id_utilisateur');",
    "\$authUser = \$r->attributes->get('auth_user'); \$idUtilisateur = (int)(\$authUser->id_utilisateur ?? \$authUser->id_admin ?? 0);",
    $content
);

file_put_contents($file, $content);

// Verify
$check = file_get_contents($file);
if (strpos($check, "auth_user") !== false) {
    echo "OK - ligne 127 corrigée\n";
    // Show the fix
    $lines = explode("\n", $check);
    foreach($lines as $i => $line) {
        if (strpos($line, 'auth_user') !== false || strpos($line, 'idUtilisateur') !== false) {
            if (strpos($line, 'mes-rendez') !== false || abs($i - 126) < 5) {
                echo ($i+1).": ".$line."\n";
            }
        }
    }
} else {
    echo "ERREUR\n";
}
