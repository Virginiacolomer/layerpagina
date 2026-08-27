import Link from "next/link";
import { getAllCategories } from "@/lib/data/products";
import { INSTAGRAM_URL, WHATSAPP_NUMBERS, whatsappLink } from "@/lib/contact";

function formatWhatsapp(number: string) {
  return `+${number}`;
}

export function SiteFooter() {
  const categories = getAllCategories();

  return (
    <footer className="mt-16 border-t border-brand-gray-200 bg-brand-gray-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <p className="text-xl font-extrabold text-brand">Layer</p>
          <p className="mt-2 text-sm text-neutral-600">
            Diseñamos en capas, pensamos en grande.
          </p>
          <p className="mt-2 text-sm text-neutral-600">Villa María, Córdoba — envíos a todo el país.</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-800">Categorías</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-neutral-600">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/productos?categoria=${c.slug}`} className="hover:text-brand">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-800">Contacto</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-neutral-600">
            {WHATSAPP_NUMBERS.map((n) => (
              <li key={n}>
                <a
                  href={whatsappLink(n, "Hola! Te escribo desde la web de Layer.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand"
                >
                  WhatsApp {formatWhatsapp(n)}
                </a>
              </li>
            ))}
            {INSTAGRAM_URL && (
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand"
                >
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <p className="border-t border-brand-gray-200 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Layer
      </p>
    </footer>
  );
}
