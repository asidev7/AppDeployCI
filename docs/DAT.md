# DAT — Document d’Architecture Technique (AppDeployCI)

## 1. Objectif

AppDeployCI est une mini application ToDo destinée à démontrer un pipeline CI/CD (GitLab) et des modes de déploiement (Docker, Vercel).

## 2. Périmètre

- Frontend : page statique servie par Express (`public/`).
- Backend : API REST JSON (`/api/items`) via Express.
- Stockage : fichier JSON local (non relationnel).

## 3. Vue d’ensemble (logique)

- `public/index.html` + `public/app.js` : interface utilisateur.
- `src/app.js` : création de l’app Express (routes + static).
- `src/handlers.js` : contrôleurs de l’API (validation + réponse HTTP).
- `src/storage.js` : persistence JSON via filesystem.

Flux principal (création d’une tâche) :
1) `public/app.js` envoie `POST /api/items` (JSON).
2) `src/handlers.js` valide `title`.
3) `src/storage.js` lit/écrit `items.json`.
4) La réponse renvoie l’item créé.

## 4. API (extraits)

- `GET /api/items` → `{ items: [...] }`
- `POST /api/items` → `{ item: {...} }` (201)
- `PATCH /api/items/:id/toggle` → `{ item: {...} }`
- `DELETE /api/items/:id` → (204)

## 5. Stockage & contraintes

- Par défaut (local / Docker) : `data/items.json` (créé automatiquement).
- Variable d’environnement : `DATA_FILE` pour override le chemin.
- Déploiement serverless (Vercel / Lambda) : filesystem en lecture seule hors `/tmp`.
  - Fallback automatique : `/tmp/appdeployci-items.json` (données éphémères).

## 6. Déploiement

### 6.1 Local

- `npm run dev` → `src/server.js` démarre un serveur HTTP.

### 6.2 Docker

- Image Node + lancement `node src/server.js`.

### 6.3 Vercel

- Entrypoint : `api/index.js` (handler serverless).
- Routage : `vercel.json` redirige toutes les routes vers la Function (UI + API).
- Remarque : stockage éphémère tant que l’app utilise `/tmp`.

## 7. Non-fonctionnel (résumé)

- Observabilité : logs `console.*` (capturés par la plateforme).
- Qualité : ESLint + Jest.
- Sécurité : pas d’authentification (démo), surface limitée à l’API ToDo.

