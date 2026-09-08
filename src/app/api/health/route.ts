import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Diagnóstico temporal: confirma que la app puede leer la base y que las
// variables de entorno críticas están cargadas. Borrar cuando el deploy
// esté estable.
export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasDirectUrl: Boolean(process.env.DIRECT_URL),
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasSupabaseKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAdminEmail: Boolean(process.env.ADMIN_EMAIL),
    hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
  };

  try {
    const [categories, products, users] = await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.user.count(),
    ]);
    return NextResponse.json({ ok: true, env, db: { categories, products, users } });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        env,
        error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      },
      { status: 500 },
    );
  }
}
