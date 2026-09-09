"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { INSTAGRAM_URL, WHATSAPP_NUMBERS, whatsappLink } from "@/lib/contact";

export function MobileNav({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  const linkClass =
    "rounded-lg px-3 py-2.5 text-base font-medium text-neutral-800 hover:bg-brand-gray-100 hover:text-brand";

  return (
    <div className="flex items-center gap-3 sm:hidden">
      <Link
        href="/carrito"
        aria-label="Carrito"
        className="relative p-1 text-neutral-700 hover:text-brand"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path
            d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .7h8.7a1 1 0 0 0 1-.8L21 8H6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="p-1 text-neutral-700 hover:text-brand"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/20"
          />
          <nav
            onClick={() => setOpen(false)}
            className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-b border-brand-gray-200 bg-white p-3 shadow-lg"
          >
            <Link href="/productos" className={linkClass}>
              Catálogo
            </Link>
            <Link href={isLoggedIn ? "/perfil" : "/login"} className={linkClass}>
              {isLoggedIn ? "Mi cuenta" : "Ingresar"}
            </Link>
            {isAdmin && (
              <Link href="/admin/pedidos" className={linkClass}>
                Admin
              </Link>
            )}
            <Link href="/carrito" className={linkClass}>
              Carrito{count > 0 ? ` (${count})` : ""}
            </Link>

            <div className="mt-2 flex items-center gap-3 border-t border-brand-gray-200 pt-3">
              {INSTAGRAM_URL && (
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-brand"
                >
                  Instagram
                </a>
              )}
              {WHATSAPP_NUMBERS[0] && (
                <a
                  href={whatsappLink(
                    WHATSAPP_NUMBERS[0],
                    "Hola! Te escribo desde la web de Layer.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
