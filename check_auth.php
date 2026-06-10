<?php
$f = '/var/www/html/app/Modules/Auth/Services/AuthService.php';
$c = file_get_contents($f);
$old = 'return new AuthOutputDTO(
    id: $user->id_utilisateur,
    nom: $user->nom,
    prenom: $user->prenom,
    email: $user->email,
    telephone: $user->telephone,
    genre: $user->genre,
    role: $user->role,
    token: $token,
    extra: $extra
);';
$new = 'return new AuthOutputDTO(
    id: $user->id_utilisateur,
    nom: $user->nom,
    prenom: $user->prenom,
    email: $user->email,
    telephone: $user->telephone,
    genre: $user->genre,
    role: $user->role,
    token: $token,
    extra: $extra
);';
echo strpos($c, 'extra') !== false ? 'extra already there' : 'missing extra';
