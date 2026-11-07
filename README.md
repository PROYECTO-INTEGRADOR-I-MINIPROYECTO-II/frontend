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

## Prototipo visual (rama de rework)

Las animaciones de la vista inicial (`CallPreview` y `ChatPreview`) son una ilustración: **aún no están basadas en la vista real de una Sala ni de su chat**. Hay que rehacerlas o retirarlas cuando existan esas pantallas.

## Probar la vista con sesión

Mientras no exista Firebase Auth (Sprint 1), `src/auth/useSession.ts` es un marcador. Con `VITE_DEMO_SESION=true` el inicio muestra el campo de passphrase activo, y el chat de demostración usa el usuario `demo`. Es una variable de build:

```bash
VITE_DEMO_SESION=true npm run dev                        # desarrollo
VITE_DEMO_SESION=true npm run build && npm run preview   # build local
```

## Estructura de `src/`

```
pages/
  main/        marco común de las páginas: Layout, header/, footer/, FondoSprites
  inicio/      una carpeta por página; lo que solo ella usa va dentro (p. ej. animations/)
  estado/  login/  ajustes/  no-encontrada/  pendiente/
utils/         lo que usa más de una página: led/, retro/, sprites/
hooks/  auth/  api/  assets/
```

Regla: un componente vive junto a la única página que lo usa; cuando una segunda página lo necesita, se sube a `utils/`. Si una vista (p. ej. la Sala) no usa encabezado ni pie, queda fuera del `Layout` de `pages/main/` en `App.tsx`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (sin `/api`). Se incrusta en el build. |
| `VITE_DEMO_SESION` | `true` simula una sesión iniciada (solo pruebas visuales). |

## Despliegue

Vercel: importar el repo (preset Vite) y definir `VITE_API_URL` con la URL de Render. En Render, `CORS_ORIGIN` del backend debe incluir la URL de Vercel.

## Scripts

`npm run dev` · `npm run build` · `npm run typecheck`
