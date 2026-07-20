Necesito que trabajes sobre ABIEL BACKEND siguiendo estrictamente este contrato arquitectónico.

IMPORTANTE:
No debes inventar arquitecturas nuevas.
No debes proponer cambios estructurales sin aprobación.
No debes introducir patrones que no existan en el proyecto.
No debes crear abstracciones innecesarias.

Tu objetivo es implementar módulos siguiendo los patrones existentes.

==================================================
ABIEL BACKEND ARCHITECTURE CONTRACT v1.0
==================================================


## 1. Tipo de arquitectura

El proyecto utiliza:

MODULAR MONOLITH ARCHITECTURE

con separación por dominios de negocio.


No es:

- microservicios
- clean architecture completa
- hexagonal pura
- event driven obligatorio
- CQRS
- DDD avanzado


Puede evolucionar hacia eso en el futuro, pero actualmente NO debe implementarse.


==================================================
2. ESTRUCTURA PRINCIPAL
==================================================

src/

modules/

empresa/
usuario/
plan/
suscripcion/


Cada módulo es independiente.


Estructura obligatoria:


module/

domain/

application/

infrastructure/

presentation/


Ejemplo:


empresa/

domain/
 └── empresa.ts


application/
 └── empresa-service.ts


infrastructure/
 ├── empresa-repository.ts
 └── prisma-empresa-repository.ts


presentation/
 └── empresa-controller.ts



==================================================
3. RESPONSABILIDAD DE CADA CAPA
==================================================


## DOMAIN


Contiene:

- entidades
- reglas de negocio
- validaciones
- estados
- transiciones


Puede:

- validar datos
- cambiar estados
- proteger invariantes


NO puede:

- importar Prisma
- importar Fastify
- acceder a base de datos
- manejar HTTP



Ejemplo:


Empresa:

activar()

suspender()

cancelar()



==================================================


## APPLICATION


Contiene casos de uso.


Responsabilidades:

- coordinar operaciones
- llamar repositorios
- validar reglas que requieren datos externos


Ejemplo:


crearEmpresa()

crearUsuario()

crearPlan()


NO puede:

- escribir SQL
- usar Prisma directamente
- manejar request HTTP



==================================================


## INFRASTRUCTURE


Contiene adaptadores técnicos.


Responsabilidades:

- Prisma
- PostgreSQL
- implementación de repositorios


Ejemplo:


interface:

EmpresaRepository


implementación:

PrismaEmpresaRepository



Regla:

El service nunca conoce Prisma.



==================================================


## PRESENTATION


Contiene:

- controllers
- rutas HTTP
- transformación request/response


Responsabilidad:


HTTP
 ↓
Controller
 ↓
Service



NO puede:

- usar Prisma
- hacer reglas de negocio
- manipular entidades directamente



==================================================
4. FLUJO OBLIGATORIO
==================================================


Toda operación debe seguir:


HTTP Request

↓

Controller

↓

Service

↓

Repository Interface

↓

Repository Prisma

↓

PostgreSQL



PROHIBIDO:


Controller → Prisma

Controller → SQL

Service → Prisma

Domain → Database



==================================================
5. MODELO MULTI TENANT
==================================================


ABIEL CORE es SaaS.


Empresa representa el tenant.


Relaciones:


Empresa

|

+ Usuario

+ Suscripción

+ Configuraciones


Todo módulo que pertenezca a una empresa debe tener:


empresaId



Ejemplo:


Usuario:

empresaId


Suscripción:

empresaId



==================================================
6. REGLAS DE CREACIÓN DE MÓDULOS
==================================================


Antes de crear un módulo nuevo:


DEBES entregar:


1.
Propósito del dominio.


2.
Entidades.


3.
Relaciones.


4.
Reglas de negocio.


5.
Modelo Prisma.


6.
Endpoints.


7.
Tests necesarios.



NO comenzar implementación sin definir diseño.



==================================================
7. TESTING OBLIGATORIO
==================================================


Cada módulo debe tener:


Entidad:

tests/modules/modulo.test.ts


Service:

tests/modules/modulo-service.test.ts


Repository:

tests/modules/modulo-repository.test.ts


HTTP:

tests/modules/modulo-endpoints.test.ts



Debe validar:


- reglas de dominio
- casos exitosos
- errores
- persistencia
- endpoints



==================================================
8. PRISMA
==================================================


Prisma solamente vive en:


infrastructure


Nunca crear:

- Prisma dentro de controller
- Prisma dentro de service


==================================================
9. CAMBIOS PERMITIDOS
==================================================


Antes de modificar:

- arquitectura
- estructura de carpetas
- patrón de módulos
- schema global


debes explicar:

1.
Por qué es necesario.


2.
Qué archivos afecta.


3.
Qué riesgos tiene.



Esperar aprobación.



==================================================
10. OBJETIVO DEL PROYECTO
==================================================


Construir ABIEL CORE como SaaS modular:


Actualmente:

Empresa
Usuario
Plan
Suscripción


Futuro:

WhatsApp Instance

Cliente

Conversación

Mensaje

Agente IA

Knowledge Base


Pero solamente implementar lo solicitado.


==================================================
REGLA FINAL PARA COPILOT
==================================================


Si una decisión no está definida:

NO inventar.

Preguntar.

Si existe un patrón en módulos anteriores:

COPIAR EL PATRÓN.

La consistencia del proyecto es más importante que introducir nuevas tecnologías.