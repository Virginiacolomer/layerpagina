import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Para páginas/layouts: redirige si no hay sesión de admin.
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/pedidos");
  }
  return session;
}

// Para server actions: las actions son endpoints invocables directamente
// (no sólo desde la página protegida), así que cada una debe volver a
// verificar el rol en vez de confiar en que el usuario llegó por la UI.
export async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado.");
  }
  return session;
}
