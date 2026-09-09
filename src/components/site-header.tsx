import Link from "next/link";
import { auth } from "@/auth";
import { CartIcon } from "@/components/cart-icon";
import { MobileNav } from "@/components/mobile-nav";
import { LayerMark } from "@/components/layer-logo";
import { INSTAGRAM_URL, WHATSAPP_NUMBERS, whatsappLink } from "@/lib/contact";

export async function SiteHeader() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="relative border-b border-brand-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-extrabold text-brand sm:text-2xl"
        >
          <LayerMark className="h-7 w-7 sm:h-8 sm:w-8" />
          Layer
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-700 sm:flex">
          <Link href="/productos" className="hover:text-brand">
            Catálogo
          </Link>
          <Link href={isLoggedIn ? "/perfil" : "/login"} className="hover:text-brand">
            {isLoggedIn ? "Mi cuenta" : "Ingresar"}
          </Link>
          {isAdmin && (
            <Link href="/admin/pedidos" className="hover:text-brand">
              Admin
            </Link>
          )}
          <CartIcon />
        </nav>

        <div className="hidden items-center gap-3 text-sm sm:flex">
          {INSTAGRAM_URL && (
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-brand"
              aria-label="Instagram de Layer"
            >
              Instagram
            </a>
          )}
          {WHATSAPP_NUMBERS[0] && (
            <a
              href={whatsappLink(WHATSAPP_NUMBERS[0], "Hola! Te escribo desde la web de Layer.")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand px-4 py-2 font-semibold text-white transition hover:opacity-90"
            >
              WhatsApp
            </a>
          )}
        </div>

        <MobileNav isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
