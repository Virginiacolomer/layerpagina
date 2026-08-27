"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function CartIcon() {
  const { count } = useCart();

  return (
    <Link href="/carrito" className="relative font-medium text-neutral-700 hover:text-brand">
      Carrito
      {count > 0 && (
        <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
