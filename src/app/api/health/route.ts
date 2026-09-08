import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyUserCredentials } from "@/lib/data/users";

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

  const checks: Record<string, string> = {};

  try {
    const [categories, products, users] = await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.user.count(),
    ]);
    checks.db = `ok (${categories} cat, ${products} prod, ${users} users)`;
  } catch (error) {
    checks.db = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }

  try {
    const hash = await bcrypt.hash("probe", 10);
    checks.bcrypt = (await bcrypt.compare("probe", hash)) ? "ok" : "compare mismatch";
  } catch (error) {
    checks.bcrypt = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }

  try {
    await verifyUserCredentials("nadie@example.com", "x");
    checks.verifyUserCredentials = "ok (ran without throwing)";
  } catch (error) {
    checks.verifyUserCredentials =
      error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }

  const ok = Object.values(checks).every((v) => v.startsWith("ok"));
  return NextResponse.json({ ok, env, checks }, { status: ok ? 200 : 500 });
}
