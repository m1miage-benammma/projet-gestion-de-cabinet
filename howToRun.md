# How to Run

## Prerequisites

- Docker & Docker Compose
- Node.js 20+
- PHP 8.4+ (for local dev without Docker)
- Composer (for local dev without Docker)

---

## Run everything with Docker

```bash
make docker-up
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:4200 |
| Backend  | http://localhost:8000 |
| MySQL    | localhost:3306        |

---

## Stop all containers

```bash
make docker-down
```

---

## Rebuild and restart

```bash
make docker-rebuild
```

---

## Run Frontend only (local)

```bash
make run-frontend
```

---

## Run Backend only (local)

```bash
make run-backend
```

---

## Install dependencies

```bash
# Frontend
make install-frontend

# Backend
make install-backend
```

---

## Run database migrations (local)

```bash
make migrate
```

---

## Run tests

```bash
make test
```

---

## Lint & format

```bash
# PHP (Pint)
make lint-backend

# Static analysis (PHPStan)
make analyse
```
