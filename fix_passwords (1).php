<?php
$hash = password_hash('Admin@2025', PASSWORD_BCRYPT);
$pdo = new PDO('mysql:host=db;dbname=gestion_cabinet', 'laravel', 'secret');
$stmt = $pdo->prepare("UPDATE utilisateurs SET mot_de_passe = ? WHERE role IN ('medecin','infirmiere','patient')");
$stmt->execute([$hash]);
echo "OK - " . $stmt->rowCount() . " utilisateurs mis a jour\n";
