<?php
$pdo = new PDO('mysql:host=db;dbname=gestion_cabinet','laravel','secret');
$hash = hash('sha256','b6c133e5d652ff955ed0cdfa8e55741bdeca4fe500063d39a9579b574b0384cd67a2339a272e6558');
$t = $pdo->query("SELECT * FROM personal_access_tokens WHERE token='$hash'")->fetch();
echo "tokenable_id: ".$t['tokenable_id']."\n";
$rdvs = $pdo->query("SELECT * FROM rendez_vous WHERE id_patient=".$t['tokenable_id'])->fetchAll();
echo "RDVs count: ".count($rdvs)."\n";
foreach($rdvs as $r) {
    echo "- RDV ".$r['id_rdv']." statut=".$r['statut']." date=".$r['date_rdv']."\n";
}

// Check what id_utilisateur the middleware sets
$attrs = $pdo->query("SELECT id_utilisateur FROM utilisateurs WHERE id_utilisateur=".$t['tokenable_id'])->fetch();
echo "utilisateur id: ".$attrs['id_utilisateur']."\n";
