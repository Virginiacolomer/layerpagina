# Layer — tienda online

E-commerce a medida para **Layer** (impresión 3D, Villa María, Córdoba):
catálogo, cuentas de cliente, carrito, cupones, checkout con pago por
transferencia y panel de administración.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript + Tailwind v4
- **PostgreSQL** en Supabase, ORM **Prisma**
- **Auth.js v5** (credenciales, sesión JWT)
- **Supabase Storage** para las fotos de producto
- **Resend** para el aviso de pedido nuevo a los dueños

## Desarrollo

```bash
npm install
cp .env.example .env   # completar los valores
npm run db:migrate     # aplica las migraciones
npm run db:seed        # categorías + productos de ejemplo
npm run dev
```

Admin local: `ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env` (la cuenta se crea
en la base la primera vez que se inicia sesión).

## Scripts

| | |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run build` / `start` | build de producción / servirlo |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | siembra categorías y productos de ejemplo |
| `npm run db:studio` | Prisma Studio |

## Deploy

Pensado para **Vercel** (la base y las fotos ya viven en Supabase). Ver las
variables de entorno en [`.env.example`](./.env.example); en Vercel no hace
falta `AUTH_TRUST_HOST`. Las migraciones se corren aparte con
`npx prisma migrate deploy` apuntando a la base de producción.
