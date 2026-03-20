use App\Modules\Utilisateur\Controller\UtilisateurController;

Route::apiResource('utilisateurs', UtilisateurController::class)
    ->only(['index', 'store', 'show', 'destroy']);