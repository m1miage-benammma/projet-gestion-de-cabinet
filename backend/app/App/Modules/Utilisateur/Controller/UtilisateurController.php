<?php
declare(strict_types=1);
namespace App\Modules\Utilisateur\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Utilisateur\DTOs\CreateUtilisateurDTO;
use App\Modules\Utilisateur\DTOs\UtilisateurOutputDTO;
use App\Modules\Utilisateur\Entity\UtilisateurEntity;
use App\Modules\Utilisateur\Manager\UtilisateurManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class UtilisateurController extends Controller
{
    public function __construct(private UtilisateurManager $manager) {}

    public function index(): JsonResponse
    {
        return response()->json(array_map(
            fn($e) => UtilisateurOutputDTO::fromEntity($e)->toArray(),
            $this->manager->getAll()
        ));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom'          => 'required|string|max:255',
            'prenom'       => 'required|string|max:255',
            'email'        => 'required|email|unique:utilisateurs',
            'telephone'    => 'nullable|string|max:20',
            'sexe'         => 'required|in:M,F',
            'mot_de_passe' => 'required|string|min:6',
            'type'         => 'required|in:medecin,patient,secretaire',
        ]);

        $dto = CreateUtilisateurDTO::fromArray($validated);
        $entity = UtilisateurEntity::create(
            nom: $dto->nom,
            prenom: $dto->prenom,
            email: $dto->email,
            telephone: $dto->telephone,
            sexe: $dto->sexe,
            motDePasse: $dto->motDePasse,
            type: $dto->type,
        );
        $saved = $this->manager->create($entity);
        return response()->json(UtilisateurOutputDTO::fromEntity($saved)->toArray(), 201);
    }

    public function show(int $id): JsonResponse
    {
        $entity = $this->manager->getById($id);
        return response()->json(UtilisateurOutputDTO::fromEntity($entity)->toArray());
    }

    public function destroy(int $id): JsonResponse
    {
        $this->manager->delete($id);
        return response()->json(null, 204);
    }
}