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

## Sesión y Firebase

La sesión es de Firebase Auth (solo en el cliente: login y token); todos los datos pasan por la API con `Authorization: Bearer <idToken>` (`src/api/base.ts`). Copia `.env.example` a `.env.local`. Para probar sin tocar el proyecto real, levanta el emulador de Auth del backend y define `VITE_FIREBASE_AUTH_EMULATOR=http://127.0.0.1:9099`.

## Estructura de `src/`

```
pages/
  main/        marco común de las páginas: Layout, header/, footer/ (incluye el panel de acceso), FondoSprites
  inicio/      una carpeta por página; lo que solo ella usa va dentro (p. ej. animations/)
  estado/  login/  ajustes/  no-encontrada/  pendiente/
utils/         lo que usa más de una página
  ui/          piezas base del producto: Boton, CampoTexto, Dialogo, Mensaje
  retro/       ventana, opciones numeradas, texto con efectos, iconos pixel art
  led/  sprites/
styles/        tokens.css (tema), led.css, efectos.css y pausa.css (siempre al final); index.css solo los importa
auth/          sesión y reglas de validación (validaciones.ts; el servidor debe aplicar las mismas)
hooks/  api/  assets/
```

Reglas: un componente vive junto a la única página que lo usa; cuando una segunda página lo necesita, se sube a `utils/`. Botones, campos, diálogos y avisos se hacen con las piezas de `utils/ui/` (no con clases sueltas) para que se vean y se comporten igual en todo el producto. Los colores van como tokens (`text-acento-claro`, no fórmulas), y todo efecto animado debe respetar «Pausar animaciones» y «reducir movimiento». Si una vista (p. ej. la Sala) no usa encabezado ni pie, queda fuera del `Layout` de `pages/main/` en `App.tsx`.

## Panel de acceso: posición y capa oscura

El panel de acceso se comporta como un diálogo modal (el foco queda dentro; Esc cierra) con una capa oscura detrás que atenúa la página. En móvil va centrado y la capa cubre toda la pantalla; desde 768 px sale pegado al pie, conectado a «Iniciar sesión», y la capa termina justo encima del pie, que no se atenúa. Mientras está abierto, el halo del fondo de sprites no reacciona al ratón.

## Cuenta y perfil

La cuenta se crea con el **primer «Confirmar»**: en el registro manual el formulario pide username, correo, contraseña y confirmación; con Google, tras el acceso se elige el username (llega uno sugerido, hay que confirmarlo). La cuenta nace con el **nombre para mostrar igual al username**, una transición «Creando tu cuenta → Cuenta creada» lo indica y sigue la vista «Completa tu perfil», que solo personaliza (por eso ya no hay «Volver atrás»).

- **Perfil:** de arriba abajo: resumen de 3 círculos (nombre, apellido, foto), foto grande, el nombre completo en vista previa y los campos separados por líneas. Se usa «Nombre/s» y «Apellido/s». ✓ válido, ✗ error, «E» gris opcional vacío. Con un ✗, `[1] Confirmar` queda en gris. Al nacer el nombre igual al username, se puede confirmar enseguida con apellido y foto vacíos.
- **Editar perfil** («Cuenta» del pie, o el enlace directo `/perfil`): igual, con `[3] Vincular con Google` o, si ya está vinculada, `[3] Desvincular de Google`; después `Cambiar username` y `Cerrar sesión`. Vincular abre la vista de Google en modo «Vincular con Google» y, al salir bien, marca la cuenta y vuelve al perfil; desvincular es inmediato. Una cuenta creada con Google no ofrece desvincular (es su único método de acceso; en Firebase `unlink` no deja quitarlo).
- **Icono de Google en el resumen:** gris si la cuenta no está vinculada, con sus colores si lo está. Al editar siempre se ve; al completar solo si la cuenta ya viene de Google (ahí no se ofrece vincular).
- **Username:** todo username válido es también un nombre válido (sin puntos o guiones bajos repetidos), para que la asignación automática nunca falle.
- **Cursor:** parpadea en el campo activo y en los campos vacíos (al centro); un campo con texto que no está activo no lo muestra.
- **Nombre en blanco:** al completar el perfil el nombre puede quedar vacío (círculo «E») y se usa el username; al editar, los campos traen escritos los valores actuales y el nombre es obligatorio.
- **Cuenta:** «Editar perfil» ofrece `Cambiar username` (vista «Editar username») y `Cerrar sesión`, que cierra la sesión de Firebase y permite crear otra cuenta.

- **Completar (obligatorio):** `/registro/username`. Sin username no se puede entrar a ninguna ruta privada (`RutaPrivada` en `src/auth/`): se redirige aquí y, al terminar, se vuelve a la ruta pedida (o al Panel).
- **Editar:** «Cuenta» (o `/perfil`) abre la misma vista con el título «Editar perfil», los datos actuales, y `[1] Guardar` / `[2] Cancelar`.
- **La cuenta se crea al final:** en el registro manual, el correo y la contraseña solo se validan y se guardan en memoria; la cuenta y el perfil se crean juntos al confirmar el perfil. Con Google la cuenta de Firebase ya existe tras el acceso, y el perfil se completa después.
- **Sesión:** `useSession` (`src/auth/useSession.ts`) escucha a Firebase y pide el perfil a `GET /api/usuarios/yo`. Mientras `cargando` ninguna ruta redirige. `refrescarSesion()` la actualiza tras un cambio; `cerrarSesion()` la cierra.

Reglas (`src/auth/validaciones.ts`; el servidor debe aplicar las mismas):
- **Username:** 3 a 20 caracteres, sin espacios; letras sin tilde, números, punto y guion bajo. Único, sin distinguir mayúsculas.
- **Nombre para mostrar:** letras de cualquier idioma (con tildes y ñ), números y espacios entre palabras (uno solo, nunca al inicio); además punto, guion, guion bajo y apóstrofo sin repetirse; sin emojis, símbolos decorativos ni «<» «>»; hasta 60 caracteres entre nombres y apellidos. **No** hay comprobación de unicidad. El apellido es opcional (en Google también puede faltar).
- En ambos se bloquean los términos que simulan ser oficiales (Admin, Soporte, Google, Verificado, Synk). Lenguaje ofensivo y suplantación de personas o marcas quedan fuera de alcance.

Los campos destacados (`CampoDestacado`) validan mientras se escriben y, si el texto no cabe en una línea, bajan de renglón y reducen la letra por tramos. El botón «Aa» (en los tres campos) alterna la tipografía de todos ellos entre Press Start 2P (activado) y Geist, y se recuerda en el navegador. El username comprueba su disponibilidad (`src/auth/disponibilidadUsername.ts`, simulada: 0,4 s, y como mínimo 1,5 s de verificación visible); están «ocupados» `ana`, `demo` y `root`. En el Sprint 1 se reemplaza por la API.

La foto se valida (JPG, PNG o WebP, hasta 2 MB) y se previsualiza; la subida real llega en el Sprint 1.

## Probar los estados del acceso con Google

Mientras no esté Firebase (Sprint 1), `src/auth/useAccesoGoogle.ts` simula el resultado: tras ~2,6 s falla con «no disponible». Para ver cada estado basta añadir `?google=` a la URL y abrir la opción de Google del panel (por ejemplo `/registro?google=cuenta-existente`):

| Valor | Resultado |
| --- | --- |
| `espera` | se queda esperando (el icono armado) |
| `exito` | acceso correcto, sin foto en la cuenta (lleva a «Completa tu perfil» rellena) |
| `exito-foto`, `exito-sin-apellido` | igual, pero la cuenta trae foto / no trae apellido |
| `cancelado`, `bloqueado`, `cuenta-existente`, `red` | error con su explicación |
| (sin valor) | error «no disponible» |

En el Sprint 1 solo cambia el interior del hook (signInWithPopup y el mapeo de errores de Firebase); la interfaz no se toca. Este parámetro debería quitarse o limitarse a desarrollo en el repo oficial.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (sin `/api`). Se incrusta en el build. |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` | Configuración pública de la app web de Firebase (ver `.env.example`). |
| `VITE_FIREBASE_AUTH_EMULATOR` | Opcional: URL del emulador de Auth (p. ej. `http://127.0.0.1:9099`) para probar en local. |

## Despliegue

Vercel: importar el repo (preset Vite) y definir `VITE_API_URL` con la URL de Render y las `VITE_FIREBASE_*`. En Render, `CORS_ORIGIN` del backend debe incluir la URL de Vercel.

## Scripts

`npm run dev` · `npm run build` · `npm run typecheck`

## Tipografías

Solo dos (S0-C03): **Geist** para el texto y **Press Start 2P** para lo retro (títulos, etiquetas, campos destacados, campo LED y estado). `font-sans` y `font-pixel` son sus únicas clases; Pixelify Sans y Orbitron se quitaron.
