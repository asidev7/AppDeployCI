# AppDeployCI

Application web simple (ToDo) conçue pour démontrer un pipeline CI/CD GitLab complet : lint, tests, build Docker, scans sécurité et déploiement.

## Démarrage local

Prérequis : Node.js 20+.

```bash
npm install
npm test
npm run dev
```

Puis ouvrir `http://localhost:3000`.

Les données sont stockées dans `data/items.json` (créé automatiquement). Vous pouvez changer le chemin via `DATA_FILE`.

## Docker

```bash
docker build -t appdeployci:local .
docker run -p 3000:3000 appdeployci:local
```

Ou avec Compose :

```bash
docker compose up --build
```

## CI/CD GitLab (résumé)

Le pipeline est défini dans `.gitlab-ci.yml` et inclut :
- `lint` (ESLint)
- `test` (Jest)
- `build_image` (build + push image Docker dans le registry GitLab)
- GitLab Security templates (SAST + Dependency Scanning)
- `deploy_prod` (déploiement via SSH sur un serveur Docker)

Note : `build_image` utilise Docker-in-Docker. Il faut un GitLab Runner autorisant le mode `privileged`.

### Variables nécessaires (déploiement)

Configurer dans GitLab > Settings > CI/CD > Variables :
- `DEPLOY_HOST` : IP/DNS du serveur
- `DEPLOY_USER` : utilisateur SSH
- `DEPLOY_PATH` : dossier sur le serveur (ex: `/opt/appdeployci`)
- `SSH_PRIVATE_KEY` : clé privée pour se connecter (format PEM)
- (optionnel) `DEPLOY_PORT` : port SSH (défaut 22)

Sur le serveur, il faut Docker + Docker Compose plugin. Le job `deploy_prod` copie automatiquement `deploy/docker-compose.prod.yml` vers `DEPLOY_PATH/docker-compose.yml`, puis lance `docker compose up -d`.

# Déploiement Vercel

Cette app est une API Express + fichiers statiques. Sur Vercel, l'entrée est `api/index.js` et `vercel.json` route toutes les requêtes vers cette Function.

Important : le filesystem est en lecture seule sur Vercel (hors `/tmp`). Par défaut, le stockage bascule donc sur `/tmp/appdeployci-items.json` (données non persistantes). Pour forcer un autre chemin, définir `DATA_FILE`.

# AppDeployCI
