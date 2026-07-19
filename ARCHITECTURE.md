# ABIEL BACKEND ARCHITECTURE

## 1. Objetivo

Abiel Backend es un monolito modular orientado a SaaS.

La arquitectura busca:
- Escalabilidad.
- Separación por dominios.
- Bajo acoplamiento.
- Facilidad para convertir módulos en servicios independientes en el futuro.
- Integración con n8n mediante endpoints y eventos.

La aplicación se construye como un Modular Monolith.

---

# 2. Principios Arquitectónicos

## 2.1 Modularidad por dominio

Cada módulo representa un dominio de negocio.

Ejemplos:

empresa
usuario
clientes
productos
ventas
whatsapp
agentes


Cada módulo es independiente y posee:

- Dominio.
- Casos de uso.
- Persistencia.
- API.


---

# 3. Estructura General


src/

├── modules/
│
│   ├── empresa/
│   │
│   │   ├── domain/
│   │   │   └── empresa.ts
│   │   │
│   │   ├── application/
│   │   │   └── empresa-service.ts
│   │   │
│   │   ├── infrastructure/
│   │   │   └── prisma-empresa-repository.ts
│   │   │
│   │   └── presentation/
│   │       └── empresa-controller.ts
│
│
├── shared/
│
│   ├── database/
│   │
│   ├── errors/
│   │
│   ├── config/
│   │
│   └── utils/
│
│
└── server.ts



---

# 4. Flujo obligatorio


HTTP Request

↓

Controller

↓

Service

↓

Repository Interface

↓

Repository Implementation

↓

Prisma

↓

PostgreSQL



Nunca:

Controller → Prisma

Controller → Database

Service → SQL directo



---

# 5. Capas


## Domain

Responsabilidad:

Reglas del negocio.

Contiene:

- Entidades.
- Validaciones.
- Estados.
- Reglas.


No conoce:

- Prisma.
- HTTP.
- Fastify.


---

## Application

Responsabilidad:

Casos de uso.


Ejemplo:

Crear empresa.

Actualizar empresa.

Eliminar empresa.


Orquesta:

Domain + Repository.


---

## Infrastructure

Responsabilidad:

Detalles técnicos.


Contiene:

- Prisma.
- PostgreSQL.
- APIs externas.


---

## Presentation

Responsabilidad:

Entrada y salida HTTP.


Contiene:

- Controllers.
- Routes.
- DTO HTTP.


---

# 6. Persistencia


Base de datos:

PostgreSQL


ORM:

Prisma


Cada entidad de negocio tiene:

- Modelo Prisma.
- Repository.
- Tests.


---

# 7. Endpoints


Cada módulo expone servicios HTTP.


Ejemplo:

Empresa:


POST /empresas

GET /empresas

GET /empresas/:id

PUT /empresas/:id

DELETE /empresas/:id



Estos endpoints serán consumidos por:

- Frontend.
- n8n.
- Integraciones externas.


---

# 8. Seguridad


La seguridad será agregada después de completar los módulos principales.


Fase actual:

NO implementar JWT.


Motivo:

Primero estabilizar:

- Dominios.
- CRUD.
- Persistencia.
- Servicios.


Fase seguridad:

- Usuarios.
- Roles.
- JWT.
- Refresh tokens.
- Permisos.


---

# 9. Testing


Cada módulo debe tener:


Unit tests:

Domain.

Service.


Integration tests:

Repository Prisma.

Endpoints.


Objetivo:

El módulo debe estar cerrado antes de avanzar.


---

# 10. Estado actual


## Completado

Empresa:

✔ Entity

✔ Service

✔ Repository

✔ Controller

✔ CRUD completo

✔ PostgreSQL

✔ Prisma

✔ Tests



---

# 11. Próximos módulos


Orden recomendado:


1. Usuario

2. Autenticación

3. Clientes

4. Productos

5. Conversaciones WhatsApp

6. Agentes IA

7. Automatizaciones n8n


---

# 12. Regla principal


No agregar funcionalidades adelantadas.

Cada módulo debe estar:

Implementado.

Probado.

Documentado.

Antes de iniciar el siguiente.