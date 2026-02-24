# Projet Gestion de Cabinet Médical

Application web fullstack pour gérer un cabinet médical (patients, rendez-vous, tâches...).

---

## C'est quoi ce projet ?

Ce projet est divisé en deux parties qui communiquent entre elles :

- **Frontend** → ce que l'utilisateur voit dans son navigateur (Angular)
- **Backend** → le serveur qui gère la logique métier et la base de données (Laravel)

```
projet/
├── frontend/      → Application Angular (interface utilisateur)
├── backend/       → API Laravel (serveur)
├── Dockerfile     → Instructions pour construire les containers Docker
├── docker-compose.yml  → Orchestre tous les services ensemble
└── Makefile       → Raccourcis de commandes
```

---

## Technologies utilisées

| Couche          | Techno     | Rôle                              |
| --------------- | ---------- | --------------------------------- |
| Frontend        | Angular 20 | Interface utilisateur (SPA)       |
| Backend         | Laravel 11 | API REST (PHP)                    |
| Base de données | MySQL 8    | Stockage des données              |
| Serveur         | Nginx      | Sert les fichiers et les requêtes |
| Conteneurs      | Docker     | Fait tourner tout ça partout      |

---

## Prérequis

Installe ces outils avant de commencer :

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — pour lancer les containers
- [Git](https://git-scm.com/) — pour cloner le projet
- [Node.js 20+](https://nodejs.org/) — si tu veux développer le frontend en local
- [PHP 8.4+](https://www.php.net/) + [Composer](https://getcomposer.org/) — si tu veux développer le backend en local

---

## Lancer le projet

### ✅ Méthode simple : tout en Docker (recommandé)

```bash
# 1. Clone le repo
git clone <url-du-repo>
cd projet-gestion-de-cabinet

# 2. Lance tous les services
make docker-up
```

C'est tout. Docker construit les images et démarre les 3 services :

| Service         | Adresse               |
| --------------- | --------------------- |
| Frontend        | http://localhost:4200 |
| Backend         | http://localhost:8000 |
| Base de données | localhost:3306        |

---

### 💻 Méthode locale (sans Docker)

```bash
# Frontend
make install-frontend
make run-frontend

# Backend
make install-backend
make migrate
make run-backend
```

---

## Architecture du backend

Le backend suit une architecture modulaire simple :

```
backend/app/Modules/
└── Task/
    ├── Entity/        → Représente un objet métier (ex: une Tâche)
    ├── Repository/    → Accès à la base de données
    ├── Manager/       → Orchestration des opérations
    ├── Services/      → Logique métier
    ├── Handler/       → Action spécifique (ex: créer une tâche)
    ├── Controller/    → Reçoit les requêtes HTTP et répond en JSON
    ├── DTOs/          → Objets de transfert de données (entrée/sortie)
    └── Exceptions/    → Gestion des erreurs
```

> **En résumé** : une requête HTTP arrive → `Controller` → `Handler` → `Service` → `Manager` → `Repository` → base de données

---

## Commandes utiles

```bash
make help           # Voir toutes les commandes disponibles
make docker-up      # Démarrer les containers
make docker-down    # Arrêter les containers
make docker-logs    # Voir les logs du backend
make migrate        # Créer les tables en base de données
make test           # Lancer les tests
make lint-backend   # Formater le code PHP
```
