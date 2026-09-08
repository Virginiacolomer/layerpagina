import { redirect } from "next/navigation";

// El panel no tiene home propia: /admin entra directo a Pedidos. El control
// de acceso lo hace el layout (requireAdmin).
export default function AdminIndexPage() {
  redirect("/admin/pedidos");
}
