<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$service = new App\Modules\Patient\Services\PatientService(new App\Modules\Patient\Manager\PatientManager(new App\Modules\Patient\Repository\PatientRepository()));
$result = $service->getPatient(1)->toArray();
echo json_encode($result);
