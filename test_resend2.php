<?php
$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, '{"from":"onboarding@resend.dev","to":["hadjerrennane@gmail.com"],"subject":"Test MediNova","html":"<h1>Test ordonnance MediNova</h1>"}');
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer re_YK8ttP37_7KND2EHSaTXhPVnvraBEanst','Content-Type: application/json']);
echo curl_exec($ch);
