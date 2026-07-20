# Abiel Core Monorepo

Este repositorio es un monorepo para el backend y el frontend administrativo de Abiel.

## Estructura

- `backend/` — implementación de la API con Fastify, Prisma y lógica de dominio.
- `frontend/` — panel administrativo en Next.js App Router para gestionar empresas.
- `shared/` — espacio compartido para tipos, interfaces y constantes entre backend y frontend.

## Scripts

- `npm install` — instala dependencias para ambos workspaces.
- `npm run dev:backend` — inicia el backend en modo desarrollo.
- `npm run dev:frontend` — inicia el frontend en modo desarrollo.
- `npm run build` — construye backend y frontend.
- `npm run test` — ejecuta pruebas en ambos workspaces.

## Puertos estándar

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`

## Notas

- El frontend puede consumir el backend usando `NEXT_PUBLIC_BACKEND_URL=http://localhost:3000`.
- Coloca la configuración compartida en `shared/` para evitar duplicación de tipos.
