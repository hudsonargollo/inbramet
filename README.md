# Inbramet — Tienda en línea (multi-sucursal)

Tienda en línea de **Inbramet**, restaurante de diseño de muebles
fundado en **1987**, con **13 sucursales** en São Paulo, Brasil. Catálogo
compartido con **stock por sucursal**, entrega a domicilio o retiro en tienda,
y un panel donde cada sucursal gestiona sus propios pedidos con sus propias
credenciales.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Prisma 6** + **PostgreSQL** (dinero en `Decimal`, moneda **Bs**)
- **Zod** para validación
- Pagos: contra entrega + PayFast / Safepay (opcionales)

## Puesta en marcha

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar la base de datos**
   Copia `.env.example` a `.env` y ajusta las conexiones:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/inbramet?schema=public"
   DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/inbramet?schema=public"
   ```

3. **Aplicar el esquema y cargar datos**
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   npm run db:create-admin
   ```

4. **Servidor de desarrollo**
   ```bash
   npm run dev
   ```
   Abre http://localhost:3000

## Scripts

| Comando | Qué hace |
| ------- | -------- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:migrate` | Crea/aplica migraciones en desarrollo |
| `npm run db:push` | Empuja el esquema sin migración |
| `npm run db:seed` | colección (58 piezas), 13 sucursales, ajustes y Clube Inbramet |
| `npm run db:studio` | Prisma Studio |
| `npm run db:create-admin` | Crea/actualiza el administrador desde `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| `npm run db:copy` | Copia datos entre dos bases (ver `prisma/copy-data.ts`) |

## Modelo de datos

`Category · Product · Branch · BranchStock · Order · OrderItem · Customer · User`
(ver `prisma/schema.prisma`).

- El **catálogo es compartido**: cada producto existe una sola vez.
- El **stock vive en `BranchStock`** (`branchId + productId`), y la tienda resuelve
  la disponibilidad para la sucursal elegida por el cliente.
- Cada `Order` pertenece a una sucursal y registra `fulfillment` (`DELIVERY` o
  `PICKUP`). El número de pedido empieza con el código de la sucursal
  (`CC01-241105-A1B2C3D4`).
- Los usuarios `STAFF` están ligados a una sucursal (`User.branchId`); los
  `ADMIN` son globales.

## Flujo del cliente

| Ruta | Página |
| ---- | ------ |
| `/` | Inicio |
| `/sucursal` | Selector de sucursal (obligatorio antes de pagar) |
| `/shop`, `/shop/[category]` | colección y categorías |
| `/product/[slug]` | Detalle de producto |
| `/search` | Búsqueda |
| `/cart` | Carrito |
| `/checkout` | Entrega o retiro + método de pago |
| `/checkout/success` | Confirmación |
| `/clube-inbramet` | Clube Inbramet — sellos, puntos y recompensas |

La sucursal elegida se guarda en la cookie `cc_branch` (180 días). Sin sucursal
se puede navegar, pero al iniciar el pago la tienda pide elegir una.

## Panel administrativo

| Ruta | Página |
| ---- | ------ |
| `/admin` | Panel — ventas, pedidos y stock bajo |
| `/admin/orders` | Pedidos (filtrados por sucursal para el personal) |
| `/admin/inventory` | Stock y disponibilidad por sucursal |
| `/admin/products` | Productos del catálogo compartido |
| `/admin/branches` | Sucursales (solo administradores) |
| `/admin/customers` | Clientes |
| `/admin/analytics`, `/insights`, `/performance` | Analíticas de ventas |
| `/admin/messages` | Mensajes de contacto |
| `/admin/settings` | Ajustes, equipo y contraseña |

En **Ajustes → Equipo** se crea el acceso de cada sucursal: rol *Personal* +
sucursal. Ese usuario solo ve y gestiona pedidos, inventario y analíticas de su
sucursal. Los *Administradores* ven todas y administran sucursales, equipo,
categorías y ajustes.

Las sesiones son cookies httpOnly firmadas con `AUTH_SECRET` (**obligatorio en
producción**), con una sola sesión activa por cuenta. Login y OTP tienen límite
de intentos.

## Despliegue

**VPS (systemd + nginx):** el build genera un servidor standalone
(`output: "standalone"`). `scripts/deploy.sh` compila, sincroniza a
`/var/www/inbramet` y reinicia `inbramet.service`. Usa **una sola instancia**
de larga duración (las alertas de pedidos y el rate limit son en memoria).

**Docker:**
```bash
docker build -t inbramet .
docker run -p 3000:3000 --env-file .env -v inbramet-uploads:/app/uploads inbramet
```

En una base nueva:
```bash
npx prisma migrate deploy
npm run db:seed        # opcional: colección + sucursales
npm run db:create-admin
```

> Las imágenes subidas desde el panel se guardan en `UPLOAD_DIR` (por defecto
> `./uploads`) y se sirven desde `/uploads/…`; usa un volumen persistente.

## Notas

- Despliegue en producción: [`docs/DEPLOY.md`](docs/DEPLOY.md).
- El seed (`prisma/seed.ts`) y los datos de respaldo sin base de datos
  (`src/lib/sample-data.ts`) reflejan el colección completo: 10 categorías y
  58 piezas con fotos en `public/imgs/menu/`.