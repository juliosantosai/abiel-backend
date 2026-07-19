# Arquitectura de Abiel Backend

## 1. Objetivo del proyecto

Construir Abiel como una plataforma SaaS para asistentes de IA sobre WhatsApp, iniciando con un MVP funcional y evitando la sobrearquitectura.

La propuesta es trabajar con un monolito modular, simple, claro y escalable a medida que el producto crezca.

## 2. Arquitectura propuesta

### Visión general

Cliente -> REST API -> Controller -> Service -> Repository -> PostgreSQL

Cada petición entra por un endpoint y termina respondiendo al cliente.

No se debe construir un sistema donde un endpoint llame directamente a otro endpoint.

## 3. Stack tecnológico

- Node.js
- TypeScript
- Fastify
- Prisma
- PostgreSQL
- JWT
- Git
- Swagger
- Docker (para etapas posteriores)

## 4. Estructura del proyecto

```text
src/
├── shared/
├── modules/
├── app.ts
└── server.ts
```

### Shared

La carpeta shared contiene la infraestructura común reutilizable por todos los módulos.

Ejemplos:

- config
- logger
- errors
- database
- auth
- utils
- events

No debe contener lógica de negocio.

### Modules

Cada módulo representa un dominio del negocio.

Ejemplos:

- empresa
- usuario
- mensaje
- conversacion
- whatsapp
- ia
- agente
- crm

Cada módulo deberá seguir una estructura similar:

```text
modulo/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

## 5. Estructura interna de un módulo

### Dominio

Contiene las entidades y reglas de negocio del módulo.

### Aplicación

Contiene los servicios y la lógica de uso del módulo.

### Infraestructura

Contiene acceso a datos, repositorios, integraciones externas y conexiones.

### Presentación

Contiene controladores y endpoints REST.

## 6. Flujo de datos

Un ejemplo de flujo típico sería:

```text
POST /empresas
  -> Controller
  -> Service
  -> Repository
  -> PostgreSQL
  -> Service
  -> Controller
  -> JSON
```

## 7. Qué NO haremos en esta etapa

No se construirán desde el inicio:

- Microservicios
- Kubernetes
- Event Bus complejo
- Motor de agentes
- Marketplace
- Plugins
- Observabilidad avanzada compleja

Todo eso quedará para futuras versiones.

## 8. Observabilidad inicial

Desde el principio se incluirán solamente:

- Logger
- Manejo de errores
- Health Check
- Swagger

Más adelante se podrán sumar:

- Métricas
- Tracing
- Dashboard
- Alertas

## 9. Gobierno del proyecto

Todo módulo deberá tener:

- Entidad
- Repository
- Service
- Controller
- Documentación
- Tests

Esto evita que el proyecto crezca de forma desordenada.

## 10. Gestión de desarrollo con Git

Se trabajará de forma profesional con ramas por funcionalidad.

Ejemplo:

```text
main
└── feature/empresa
└── feature/usuario
└── feature/mensaje
```

No se desarrollará directamente sobre main.

## 11. Desarrollo asistido por IA

El desarrollo no se realizará de una sola vez.

El flujo recomendado será:

1. Tomar un archivo
2. Generar el contenido
3. Leerlo
4. Corregirlo
5. Probarlo
6. Commit
7. Pasar al siguiente archivo

Esto permite mantener control del código y reducir errores.

## 12. Fases del proyecto

### Fase 1

- Proyecto TypeScript
- Fastify
- Git
- Shared
- Logger
- Configuración

### Fase 2

- Módulo Empresa
- Entidad
- CRUD
- Tests
- Swagger

### Fase 3

- Módulo Usuario
- Login
- JWT
- Roles

### Fase 4

- WhatsApp
- Conexión
- Mensajes
- Conversaciones

### Fase 5

- IA
- Prompt
- Contexto
- Respuesta

### Fase 6

- Panel Web
- Dashboard
- Empresas
- Usuarios
- Conversaciones

## 13. Filosofía del proyecto

La mayor conclusión de este proceso fue:

Primero construir un producto que funcione; después construir una plataforma.

Durante mucho tiempo se intentó diseñar una arquitectura muy ambiciosa antes de tener un sistema operativo. A partir de ahora, cada módulo será pequeño, probado e integrado paso a paso.

El objetivo es llegar cuanto antes a un MVP que pueda usarse con clientes reales y, a partir de esa experiencia, evolucionar Abiel hacia una plataforma más completa.
