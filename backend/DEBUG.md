# Bitácora de Resolución: Prisma 7 & Jest (Abiel 2.0)

## 1. El problema (síntomas)

- Error P1012: `url` ya no es soportado en `schema.prisma`.
- Error `MODULE_NOT_FOUND`: confusión entre rutas manuales en `src/generated` y la ruta estándar en `node_modules/@prisma/client`.
- Error Jest `SyntaxError: Unexpected token`: Jest no podía procesar archivos `.ts` generados por Prisma ni módulos ESM como `uuid`.

## 2. La solución técnica (stack estable)

### Configuración de `schema.prisma`

- Mantener el `schema.prisma` limpio de configuraciones de conexión.
- Solo definir:

```prisma
datasource db {
  provider = "postgresql"
}
```

- No definir `output`: dejar que Prisma use su directorio por defecto dentro de `node_modules`.

### Configuración del cliente Prisma

- No importar desde `src/generated`.
- Importar siempre:

```js
const { PrismaClient } = require("@prisma/client");
```

- Pasar la conexión explícitamente en el constructor, ya que Prisma 7 lo requiere:

```js
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

### Estrategia de testing con Jest

- No intentar configurar Jest para leer TypeScript: no vale la pena.
- Si Jest falla al leer una dependencia como `uuid` o `prisma`, usar `jest.mock()` al inicio del test para aislar el problema en lugar de forzar a Jest a compilar código ajeno.

## 3. Protocolo de emergencia

Si vuelve a fallar la conexión o los módulos, seguir este orden antes de tocar código:

1. `rm -rf node_modules package-lock.json`
2. `npm cache clean --force`
3. `npm install`
4. `npx prisma generate`
5. Verificar `.env` y la cadena de conexión.

### Nota importante

Si aparece un error de autenticación tipo `SCRAM`, revisar que:

- `dotenv.config()` se esté ejecutando correctamente.
- La cadena de conexión sea válida.
- La base de datos acepte el usuario y contraseña configurados.

## 4. Resumen rápido

- Prisma 7 funciona mejor si no se mezcla con configuraciones manuales de `output`.
- El cliente debe instanciarse desde `@prisma/client` y con un adapter explícito.
- Jest debe aislarse con mocks cuando el problema viene de dependencias externas.

> Este documento sirve como referencia rápida para evitar repetir el mismo bloqueo en futuras sesiones.
