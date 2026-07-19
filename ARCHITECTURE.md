# Arquitectura de Abiel Backend

## 1. Estado del documento

Este documento define la arquitectura oficial de Abiel Backend MVP.

Todas las decisiones de desarrollo deben respetar esta arquitectura.

El desarrollo asistido por IA (Copilot u otras herramientas) debe utilizar este documento como guía principal.

Si una propuesta contradice esta arquitectura, debe considerarse una propuesta futura y no implementarse sin revisión.

---

# 2. Objetivo del proyecto

Construir Abiel como una plataforma SaaS para asistentes de IA sobre WhatsApp.

El objetivo inicial es crear un MVP funcional, simple y mantenible, evitando la sobrearquitectura.

La estrategia es:

**Primero construir un producto que funcione; después construir una plataforma.**

Abiel comenzará como un monolito modular preparado para evolucionar con el crecimiento del producto.

---

# 3. Arquitectura general

Abiel utiliza una arquitectura de monolito modular.

Cada módulo representa una capacidad del negocio y mantiene sus propias responsabilidades.

Flujo general:

```
Cliente
   |
REST API
   |
Controller
   |
Application Service
   |
Repository Interface
   |
Prisma Repository
   |
PostgreSQL
```

Regla fundamental:

Un endpoint nunca debe llamar directamente a otro endpoint.

La comunicación debe ocurrir mediante servicios, dominio o componentes internos.

---

# 4. Stack tecnológico

Tecnologías principales:

* Node.js
* TypeScript
* Fastify
* Prisma ORM
* PostgreSQL
* JWT
* Swagger
* Docker
* Git

---

# 5. Estructura del proyecto

```
src/
├── shared/
├── modules/
├── app.ts
└── server.ts
```

---

# 6. Carpeta Shared

La carpeta `shared` contiene infraestructura común reutilizable.

Ejemplos:

```
shared/
├── config
├── logger
├── errors
├── database
├── auth
├── utils
└── events
```

Responsabilidades:

* Configuración global
* Conexiones externas
* Logger
* Manejo de errores
* Utilidades comunes

Regla:

`shared` NO debe contener lógica de negocio.

---

# 7. Arquitectura de módulos

Cada módulo representa un dominio del negocio.

Ejemplos:

```
empresa
usuario
mensaje
conversacion
whatsapp
ia
agente
crm
```

Cada módulo debe mantener esta estructura:

```
modulo/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

Ejemplo:

```
empresa/

domain/
└── empresa.ts

application/
└── empresa-service.ts

infrastructure/
└── prisma-empresa-repository.ts

presentation/
└── empresa-controller.ts
```

---

# 8. Responsabilidad de cada capa

## Domain

Contiene:

* Entidades
* Reglas de negocio
* Validaciones propias del dominio

No debe conocer:

* Prisma
* HTTP
* Fastify
* PostgreSQL

---

## Application

Contiene:

* Casos de uso
* Servicios
* Coordinación entre dominio y repositorios

Debe depender de interfaces, no de implementaciones concretas.

---

## Infrastructure

Contiene:

* Prisma
* Base de datos
* APIs externas
* Implementaciones de repositorios

Aquí vive la comunicación con el mundo externo.

---

## Presentation

Contiene:

* Controllers
* Routes
* Validación HTTP
* Respuestas API

No debe contener reglas de negocio.

---

# 9. Ejemplo de flujo

Crear empresa:

```
POST /empresas

        |
        v

EmpresaController

        |
        v

EmpresaService

        |
        v

EmpresaRepository

        |
        v

Prisma

        |
        v

PostgreSQL
```

Respuesta:

```
PostgreSQL

        |
        v

Repository

        |
        v

Service

        |
        v

Controller

        |
        v

JSON Response
```

---

# 10. Reglas para desarrollo asistido por IA

Copilot debe respetar:

* No crear microservicios.
* No crear Kubernetes.
* No crear sistemas distribuidos sin necesidad.
* No crear abstracciones sin uso real.
* No mover lógica de negocio al Controller.
* No colocar Prisma directamente en Services.
* No colocar lógica de negocio en Repository.
* No modificar arquitectura sin autorización.
* No crear módulos innecesarios.
* Priorizar código simple y mantenible.

Cada cambio debe seguir este proceso:

1. Leer arquitectura.
2. Modificar un archivo o pequeño conjunto de archivos.
3. Ejecutar pruebas.
4. Revisar errores.
5. Commit.
6. Continuar con el siguiente paso.

---

# 11. Observabilidad inicial

Desde el inicio se implementará:

* Logger
* Manejo centralizado de errores
* Health Check
* Swagger

Futuro:

* Métricas
* Tracing
* Alertas
* Dashboard avanzado

---

# 12. Requisitos de cada módulo

Todo módulo debe incluir:

* Entidad de dominio
* Repository Interface
* Repository Implementation
* Service
* Controller
* Documentación
* Tests

No se considera terminado un módulo si solamente existe código de dominio.

---

# 13. Gestión con Git

El desarrollo debe realizarse mediante ramas.

Ejemplo:

```
main

feature/empresa

feature/usuario

feature/mensaje
```

No desarrollar directamente sobre `main`.

Cada funcionalidad debe tener:

* Código
* Tests
* Commit independiente

---

# 14. Fases del proyecto

## Fase 1 - Infraestructura base

Objetivo:

Tener una aplicación funcionando correctamente.

Incluye:

* Proyecto TypeScript
* Fastify
* Prisma
* PostgreSQL
* Docker
* Configuración
* Logger
* Manejo de errores
* Health Check
* Swagger
* Tests base

Criterio de cierre:

La aplicación inicia correctamente y conecta con PostgreSQL.

---

# Fase 2 - Primer módulo vertical

Módulo Empresa:

Incluye:

* Entidad Empresa
* Repository
* Service
* Controller
* CRUD
* Swagger
* Tests
* Persistencia real

Criterio de cierre:

Crear una empresa mediante API y verla persistida en PostgreSQL.

---

# Fase 3 - Usuarios

Incluye:

* Usuario
* Login
* JWT
* Roles
* Autorización

---

# Fase 4 - WhatsApp

Incluye:

* Conexión WhatsApp
* Instancias
* Mensajes
* Conversaciones

---

# Fase 5 - Inteligencia Artificial

Incluye:

* Prompt
* Contexto
* Respuestas
* Memoria
* Configuración del asistente

---

# Fase 6 - Panel Web

Incluye:

* Dashboard
* Empresas
* Usuarios
* Conversaciones
* Administración SaaS

---

# 15. Filosofía del proyecto

Abiel debe evolucionar de forma incremental.

La prioridad es:

1. Producto funcional.
2. Clientes reales.
3. Aprendizaje del mercado.
4. Escalabilidad progresiva.

No construir una plataforma compleja antes de validar el producto.

La arquitectura debe crecer junto con las necesidades reales.

---

# Regla final

Cada nueva funcionalidad debe responder:

"¿Esto ayuda al MVP actual o es una necesidad futura?"

Si es futuro, se documenta pero no se implementa todavía.
