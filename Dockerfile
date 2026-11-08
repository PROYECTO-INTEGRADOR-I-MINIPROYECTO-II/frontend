FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
# Vite incrusta las VITE_* al compilar y las lee del .env de la raíz del proyecto, que entra solo en esta etapa de build: la imagen final
# (nginx) únicamente recibe dist/. La configuración web de Firebase es pública por diseño; no pasa por ARG/ENV.
COPY . .
RUN for v in VITE_FIREBASE_API_KEY VITE_FIREBASE_AUTH_DOMAIN VITE_FIREBASE_PROJECT_ID VITE_FIREBASE_APP_ID; do \
      grep -q "^$v=." .env 2>/dev/null || { echo "Falta $v en el .env (copia .env.example a .env antes de construir)"; exit 1; }; \
    done; \
    npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
