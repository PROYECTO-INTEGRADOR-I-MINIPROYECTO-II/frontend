# Synk Frontend

React + TypeScript + Tailwind (Vite) de Synk, salas de estudio. Sprint 0: la vista inicial pide `GET /api/base` a la API (Render) y muestra el dato que viene de Firestore, con estados de carga, error (con «Reintentar») y éxito. El frontend nunca consulta Firestore directamente.

## Correr local

```bash
cp .env.example .env   # VITE_API_URL = URL de la API
npm install
npm run dev            # http://localhost:5173
```

## Docker

```bash
VITE_API_URL=https://<api-en-render> docker compose up --build   # http://localhost:5173
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (sin `/api`). Se incrusta en el build. |

## Despliegue

Vercel: importar el repo (preset Vite) y definir `VITE_API_URL` con la URL de Render. En Render, `CORS_ORIGIN` del backend debe incluir la URL de Vercel.

## Scripts

`npm run dev` · `npm run build` · `npm run typecheck`
