<?php
declare(strict_types=1);
namespace App\Modules\Utilisateur\Entity;

class UtilisateurEntity
{
    public function __construct(
        protected int $id,
        protected string $nom,
        protected string $prenom,
        protected string $email,
        protected ?string $telephone,
        protected string $sexe,
        protected string $motDePasse,
        protected string $type,
        protected ?\DateTime $createdAt = null,
        protected ?\DateTime $updatedAt = null,
    ) {}

    public static function create(
        string $nom,
        string $prenom,
        string $email,
        ?string $telephone,
        string $sexe,
        string $motDePasse,
        string $type,
    ): self {
        return new self(
            id: 0,
            nom: $nom,
            prenom: $prenom,
            email: $email,
            telephone: $telephone,
            sexe: $sexe,
            motDePasse: bcrypt($motDePasse),
            type: $type,
            createdAt: new \DateTime(),
            updatedAt: new \DateTime(),
        );
    }

    public function getId(): int { return $this->id; }
    public function getNom(): string { return $this->nom; }
    public function getPrenom(): string { return $this->prenom; }
    public function getEmail(): string { return $this->email; }
    public function getTelephone(): ?string { return $this->telephone; }
    public function getSexe(): string { return $this->sexe; }
    public function getMotDePasse(): string { return $this->motDePasse; }
    public function getType(): string { return $this->type; }
    public function getCreatedAt(): ?\DateTime { return $this->createdAt; }
    public function getUpdatedAt(): ?\DateTime { return $this->updatedAt; }

    public function toArray(): array
    {
        return [
            'id'           => $this->id,
            'nom'          => $this->nom,
            'prenom'       => $this->prenom,
            'email'        => $this->email,
            'telephone'    => $this->telephone,
            'sexe'         => $this->sexe,
            'mot_de_passe' => $this->motDePasse,
            'type'         => $this->type,
            'created_at'   => $this->createdAt?->format('Y-m-d H:i:s'),
            'updated_at'   => $this->updatedAt?->format('Y-m-d H:i:s'),
        ];
    }
}