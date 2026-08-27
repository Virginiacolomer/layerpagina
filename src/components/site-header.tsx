import Link from "next/link";
import { auth } from "@/auth";
import { INSTAGRAM_URL, WHATSAPP_NUMBERS, whatsappLink } from "@/lib/contact";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-brand-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-2xl font-extrabold text-brand">
          Layer
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-700 sm:flex">
          <Link href="/productos" className="hover:text-brand">
            Catálogo
          </Link>
          <Link href={session?.user ? "/perfil" : "/login"} className="hover:text-brand">
            {session?.user ? "Mi cuenta" : "Ingresar"}
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-sm">
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
      </div>
    </header>
  );
}
