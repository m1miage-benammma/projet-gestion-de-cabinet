<?php
$hash = password_hash('Infirmiere@2025', PASSWORD_BCRYPT);
$pdo = new PDO('mysql:host=db;dbname=gestion_cabinet', 'laravel', 'secret');
$pdo->exec("UPDATE utilisateurs SET mot_de_passe='$hash' WHERE email='sara.benali@cabinet.dz'");
echo 'OK: ' . $hash;
