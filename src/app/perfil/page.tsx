import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export const metadata: Metadata = { title: "Mi cuenta | Layer" };

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold text-neutral-900">Mi cuenta</h1>

      <div className="mt-6 rounded-xl border border-brand-gray-200 p-5">
        <p className="text-sm text-neutral-500">Nombre</p>
        <p className="font-medium text-neutral-900">{session.user.name}</p>
        <p className="mt-3 text-sm text-neutral-500">Email</p>
        <p className="font-medium text-neutral-900">{session.user.email}</p>
      </div>

      <div className="mt-6 rounded-xl border border-brand-gray-200 p-5">
        <p className="font-medium text-neutral-900">Mis pedidos</p>
        <p className="mt-1 text-sm text-neutral-500">Todavía no hiciste ningún pedido.</p>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="rounded-full border border-brand-gray-300 px-5 py-2 text-sm font-semibold text-neutral-700 transition hover:border-brand hover:text-brand"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
