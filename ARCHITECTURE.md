# Arquitectura Abiel Backend

## 1. Objetivo del proyecto

Abiel Backend es una plataforma SaaS para asistentes de inteligencia artificial sobre WhatsApp.

La primera etapa del proyecto busca construir una base sólida, simple y mantenible mediante un monolito modular.

La prioridad es:

> Primero construir un producto funcional.
> Después evolucionar hacia una plataforma completa.

No se debe crear arquitectura futura antes de tener funcionalidades reales funcionando.

---

# 2. Filosofía de desarrollo

El proyecto seguirá estos principios:

- Código simple.
- Bajo acoplamiento.
- Responsabilidades claras.
- Módulos independientes.
- Pruebas antes de avanzar.
- Cambios pequeños y controlados.

Cada módulo debe estar completo antes de crear el siguiente.

Un módulo completo significa:

- Entidad de dominio.
- Servicio.
- Repository.
- Persistencia.
- Controller.
- Endpoint.
- Tests.

---

# 3. Arquitectura general

Abiel utiliza un:

## Monolito modular

No utilizar:

- Microservicios.
- Kubernetes.
- Arquitectura distribuida.
- Event Bus complejo.
- Sistemas de plugins.
- Marketplace.

Eso pertenece a futuras versiones.

---

# 4. Stack tecnológico

Backend:

- Node.js
- TypeScript
- Fastify
- Prisma
- PostgreSQL
- Docker
- Jest
- Swagger

Base de datos:

PostgreSQL ejecutado mediante Docker.

ORM:

Prisma.

---

# 5. Flujo de una petición

Toda petición debe seguir este flujo:

Cliente

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL


Nunca:

- Controller llamando directamente a Prisma.
- Endpoint llamando otro endpoint.
- Lógica de negocio dentro del Controller.

---

# 6. Estructura del proyecto


src/

├── shared/

│   ├── config

│   ├── database

│   ├── logger

│   ├── errors

│   └── utils


├── modules/

│   └── empresa/

│       ├── domain/

│       ├── application/

│       ├── infrastructure/

│       └── presentation/


├── app.ts

└── server.ts


---

# 7. Shared

Shared contiene infraestructura común.

Permitido:

- Configuración.
- Base de datos.
- Logger.
- Errores.
- Utilidades.

No debe contener:

- Reglas de negocio.
- Entidades del dominio.
- Lógica específica de módulos.

---

# 8. Módulos

Cada módulo representa una capacidad del negocio.

Ejemplos futuros:

- empresa
- usuario
- whatsapp
- conversacion
- mensaje
- ia
- agente
- crm


Pero solamente se implementará un módulo a la vez.

---

# 9. Estructura interna de módulo


## Domain

Contiene:

- Entidades.
- Reglas de negocio.
- Validaciones.

No conoce:

- Prisma.
- Fastify.
- PostgreSQL.


## Application

Contiene:

- Casos de uso.
- Servicios.

Ejemplo:

EmpresaService.


## Infrastructure

Contiene:

- Implementaciones Repository.
- Prisma.
- Servicios externos.


## Presentation

Contiene:

- Controllers.
- Rutas HTTP.
- Validación de entrada.

---

# 10. Estado actual del proyecto

Estamos en:

## Fase 2 - Módulo Empresa


Objetivo:

Crear el primer módulo vertical funcionando completamente.


Debe permitir:

Crear empresa.

Consultar empresa.

Persistir información en PostgreSQL.

Responder mediante API REST.


---

# 11. Lo que NO se debe implementar todavía


No crear:

- JWT.
- Login.
- Usuarios.
- Roles.
- WhatsApp.
- IA.
- Agentes.
- Eventos complejos.
- Redis.
- Colas.
- Microservicios.


Aunque sean parte del futuro del producto.

---

# 12. Base de datos


La base de datos debe manejarse mediante:

- Prisma.
- PostgreSQL.
- Docker.


Herramientas permitidas para revisar DB:

- Prisma CLI.
- psql dentro del contenedor.


No utilizar:

- Python.
- Jupyter Notebook.
- Scripts externos.


La solución debe mantenerse dentro del stack del proyecto.

---

# 13. Uso de IA en desarrollo


Copilot debe trabajar como un desarrollador del equipo.


Antes de modificar:

1. Leer ARCHITECTURE.md.
2. Revisar código existente.
3. Entender la fase actual.
4. Cambiar solamente lo necesario.


No agregar dependencias ni tecnologías nuevas sin autorización.

---

# 14. Validación obligatoria


Antes de finalizar cualquier tarea ejecutar:


npm run build


npm test


Si corresponde:


npx prisma db push


y probar endpoints.


---

# 15. Git


Trabajar mediante ramas:

main

feature/empresa

feature/usuario


No trabajar directamente sobre main.

---

# 16. Objetivo inmediato


Completar Empresa.

Cuando Empresa funcione correctamente:

- Persistencia funcionando.
- Endpoint funcionando.
- Tests funcionando.


Recién después comenzar Usuario.

