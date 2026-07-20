
# ABIEL BACKEND ARCHITECTURE

## 1. Objetivo

Abiel Backend es un monolito modular orientado a SaaS, diseñado para soportar dominios de negocio independientes con bajo acoplamiento entre módulos.

La arquitectura permite:

- Separación por dominio de negocio.
- Evolución incremental del sistema.
- Separación entre reglas de negocio y detalles técnicos.
- Persistencia mediante Prisma y PostgreSQL.
- Exposición de APIs REST mediante Fastify.
- Preparación futura para separar módulos en servicios independientes.

La prioridad del proyecto es mantener un núcleo estable antes de agregar funcionalidades externas como WhatsApp, IA o automatizaciones.

---

# 2. Arquitectura general

ABIEL utiliza una arquitectura modular por dominio.

Cada módulo contiene:

```

src/modules/

├── empresa/
├── usuario/
├── plan/
└── suscripcion/

```

Cada módulo mantiene cuatro capas:

```

domain/
Entidades y reglas de negocio.

application/
Casos de uso y orquestación.

infrastructure/
Persistencia y adaptadores técnicos.

presentation/
HTTP Controllers y rutas.

```

---

# 3. Flujo obligatorio de ejecución

Todo módulo debe respetar:

```

HTTP Request

```
  ↓
```

Controller

```
  ↓
```

Service

```
  ↓
```

Repository Interface

```
  ↓
```

Repository Prisma

```
  ↓
```

PostgreSQL

```

---

## Prohibido

No implementar:

```

Controller → Prisma
Controller → Database

Service → SQL directo

Domain → Prisma

Domain → Fastify

```

---

# 4. Estructura del proyecto

```

src/

├── modules/

│   ├── empresa/
│   ├── usuario/
│   ├── plan/
│   └── suscripcion/

│

├── shared/

│   ├── database/
│   ├── config/
│   ├── errors/
│   └── utils/

│

├── app.ts
└── server.ts

```

---

# 5. Capas

## Domain

Responsabilidad:

- Entidades.
- Reglas de negocio.
- Validaciones.
- Estados.
- Transiciones.

No conoce:

- Prisma.
- PostgreSQL.
- HTTP.
- Fastify.

---

## Application

Responsabilidad:

- Casos de uso.
- Orquestación.
- Coordinación entre entidades y repositorios.

Ejemplo:

```

crearEmpresa()

crearUsuario()

crearPlan()

crearSuscripcion()

```

No accede directamente a Prisma.

---

## Infrastructure

Responsabilidad:

- Implementación de repositorios.
- Comunicación con Prisma.
- Conversión entre modelos Prisma y dominio.

Ejemplo:

```

prisma-empresa-repository.ts

prisma-plan-repository.ts

prisma-suscripcion-repository.ts

```

---

## Presentation

Responsabilidad:

- Recibir HTTP.
- Validar entrada básica.
- Llamar servicios.
- Responder códigos HTTP.

No contiene reglas de negocio.

---

# 6. Módulos implementados

Actualmente ABIEL CORE contiene:

```

Empresa
Usuario
Plan
Suscripcion

```

---

# 7. Dominio Empresa

## Propósito

Representa el tenant dentro del sistema SaaS.

Una empresa es un cliente independiente del sistema.

## Responsabilidades

- Crear empresa.
- Activar empresa.
- Suspender empresa.
- Cancelar empresa.

## Reglas

- Nombre obligatorio.
- Estado controlado por dominio.

---

# 8. Dominio Usuario

## Propósito

Gestionar usuarios pertenecientes a una empresa.

Relación:

```

Empresa 1:N Usuario

```

## Responsabilidades

- Crear usuarios.
- Actualizar usuarios.
- Activar usuarios.
- Desactivar usuarios.

## Reglas

- empresaId obligatorio.
- nombre obligatorio.
- email obligatorio.
- email normalizado.
- Usuario pertenece a una empresa.

---

# 9. Dominio Plan

## Propósito

Representa el catálogo comercial del SaaS.

Un Plan define una oferta disponible.

## Responsabilidades

- Crear planes.
- Actualizar planes.
- Activar planes.
- Desactivar planes.

## Reglas

- nombre obligatorio.
- slug único.
- precio no negativo.
- intervalo permitido:

```

MENSUAL
ANUAL

```

---

# 10. Dominio Suscripción

## Propósito

Representa la contratación de un plan por una empresa.

Une:

```

Empresa
|
|
Suscripcion
|
|
Plan

```

## Relaciones

```

Empresa 1:N Suscripcion

Plan 1:N Suscripcion

```

---

## Responsabilidades

- Crear suscripción.
- Consultar suscripción.
- Activar suscripción.
- Cancelar suscripción.
- Renovar suscripción.

---

## Reglas

- empresaId obligatorio.
- planId obligatorio.
- Solo planes activos pueden contratarse.
- Una empresa debe tener control sobre su suscripción activa.
- Los cambios deben mantener historial lógico.

---

# 11. Modelo SaaS actual

```

```
             PLAN

              |

              |

         SUSCRIPCION

              |

              |

           EMPRESA

              |

              |

           USUARIO
```

```

---

# 12. Prisma

Prisma es utilizado únicamente en infraestructura.

Modelo:

```

Domain

↓

Repository Interface

↓

Prisma Repository

↓

PostgreSQL

```

---

# 13. Registro de módulos

Todos los módulos deben registrarse en:

```

src/app.ts

```

Responsabilidades:

- Crear repositorios.
- Crear servicios.
- Registrar rutas.

---

# 14. Testing

Cada módulo debe contener:

## Entity Tests

Validan:

- reglas del dominio.
- estados.
- errores.

## Service Tests

Validan:

- casos de uso.
- interacción con repositorios.

## Repository Tests

Validan:

- persistencia Prisma.

## Endpoint Tests

Validan:

- HTTP.
- respuestas.
- códigos.

---

# 15. Estado actual del proyecto

Implementado:

✅ Empresa  
✅ Usuario  
✅ Plan  
✅ Suscripción  

Tests actuales:

✅ Dominio  
✅ Servicios  
✅ Repositorios  
✅ Endpoints HTTP  

---

# 16. Próximos dominios previstos

Los próximos módulos deben seguir este orden:

## ConfiguracionEmpresa

Responsabilidad:

- identidad comercial.
- preferencias.
- configuración del tenant.

---

## Canales

Responsabilidad:

- WhatsApp.
- Integraciones externas.

---

## Conversacion

Responsabilidad:

- mensajes.
- historial.
- estados.

---

## Agente IA

Responsabilidad:

- configuración del agente.
- prompts.
- conocimiento.
- automatizaciones.

---

# 17. Regla principal para nuevos desarrollos

Antes de crear cualquier módulo:

1. Leer ARCHITECTURE_CONTRACT.md.
2. Analizar módulos existentes.
3. Definir dominio.
4. Definir entidad.
5. Definir reglas.
6. Definir Prisma.
7. Definir endpoints.
8. Crear tests.
9. Implementar.

No crear nuevas capas sin modificar primero el contrato arquitectónico.
