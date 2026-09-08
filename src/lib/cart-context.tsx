"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import type { CartLine, ResolvedCartLine } from "@/lib/catalog-types";
import { checkCouponAction, resolveCartAction } from "@/lib/actions/cart-actions";

type CartContextValue = {
  lines: CartLine[];
  resolvedLines: ResolvedCartLine[];
  count: number;
  subtotal: number;
  pricesLoaded: boolean;
  couponCode: string | null;
  discount: number;
  couponError: string | null;
  applyingCoupon: boolean;
  addItem: (
    productId: string,
    variantId: string | undefined,
    quantity: number,
    colors?: string[],
  ) => void;
  removeItem: (line: LineRef) => void;
  setQuantity: (line: LineRef, quantity: number) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  clear: () => void;
};

type LineRef = { productId: string; variantId?: string; colors?: string[] };

const CartContext = createContext<CartContextValue | null>(null);
const LINES_KEY = "layer-cart";
const COUPON_KEY = "layer-cart-coupon";

// Una línea del carrito se identifica por producto + variante + colores
// elegidos (dos combinaciones de colores distintas son líneas distintas).
function lineKey(ref: LineRef) {
  return `${ref.productId}:${ref.variantId ?? ""}:${(ref.colors ?? []).join("|")}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [pending, startTransition] = useTransition();

  // Hidratación intencional en un efecto: localStorage no existe durante el
  // render en el servidor, así que leerlo antes del mount rompería el
  // hydration match. El re-render extra que dispara es el costo esperado de
  // este patrón, no un bug.
  useEffect(() => {
    try {
      const rawLines = localStorage.getItem(LINES_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (rawLines) setLines(JSON.parse(rawLines));
      const rawCoupon = localStorage.getItem(COUPON_KEY);
      if (rawCoupon) setCouponCode(JSON.parse(rawCoupon));
    } catch {
      // localStorage no disponible o con datos corruptos: seguimos con el carrito vacío
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LINES_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(COUPON_KEY, JSON.stringify(couponCode));
  }, [couponCode, hydrated]);

  // El carrito guarda sólo ids + cantidades; los precios y datos de producto se
  // piden al servidor cada vez que cambian las líneas (ver resolveCartAction).
  // Guardamos el resultado junto con la "firma" de las líneas que lo generaron:
  // mientras no coincida con las líneas actuales, sabemos que está en vuelo y
  // los valores derivados vuelven a cero sin necesidad de un setState síncrono.
  const linesKey = useMemo(() => JSON.stringify(lines), [lines]);
  const [resolved, setResolved] = useState<{
    key: string;
    lines: ResolvedCartLine[];
    subtotal: number;
  }>({ key: "[]", lines: [], subtotal: 0 });

  useEffect(() => {
    if (!hydrated || lines.length === 0) return;
    let cancelled = false;
    resolveCartAction(lines).then((result) => {
      if (cancelled) return;
      setResolved({ key: linesKey, lines: result.lines, subtotal: result.subtotal });
    });
    return () => {
      cancelled = true;
    };
    // linesKey resume el contenido de `lines`; no hace falta depender de ambos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linesKey, hydrated]);

  const upToDate = resolved.key === linesKey;
  const resolvedLines = lines.length === 0 ? [] : upToDate ? resolved.lines : [];
  const subtotal = lines.length === 0 ? 0 : upToDate ? resolved.subtotal : 0;
  const pricesLoaded = lines.length === 0 || upToDate;

  // Re-valida el cupón aplicado cada vez que cambia el subtotal (por ejemplo
  // si el cliente modifica cantidades), para no dejar un descuento aplicado
  // que ya no corresponde (mínimo de compra, cupón desactivado, etc).
  useEffect(() => {
    if (!hydrated || !couponCode) return;
    let cancelled = false;
    checkCouponAction(couponCode, subtotal).then((result) => {
      if (cancelled) return;
      if (result.valid) {
        setDiscount(result.discount);
        setCouponError(null);
      } else {
        setDiscount(0);
        setCouponCode(null);
        setCouponError(result.message);
      }
    });
    return () => {
      cancelled = true;
    };
    // Sólo debe re-correr cuando cambia el subtotal, no cuando cambia couponCode
    // (eso ya lo maneja applyCoupon).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, hydrated]);

  const addItem: CartContextValue["addItem"] = (productId, variantId, quantity, colors) => {
    setLines((prev) => {
      const key = lineKey({ productId, variantId, colors });
      if (prev.some((l) => lineKey(l) === key)) {
        return prev.map((l) =>
          lineKey(l) === key ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...prev, { productId, variantId, quantity, colors }];
    });
  };

  const removeItem: CartContextValue["removeItem"] = (ref) => {
    const key = lineKey(ref);
    setLines((prev) => prev.filter((l) => lineKey(l) !== key));
  };

  const setQuantity: CartContextValue["setQuantity"] = (ref, quantity) => {
    const key = lineKey(ref);
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => lineKey(l) !== key)
        : prev.map((l) => (lineKey(l) === key ? { ...l, quantity } : l)),
    );
  };

  const applyCoupon = (code: string) => {
    setCouponError(null);
    startTransition(async () => {
      const result = await checkCouponAction(code, subtotal);
      if (result.valid) {
        setCouponCode(result.coupon.code);
        setDiscount(result.discount);
      } else {
        setCouponError(result.message);
      }
    });
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscount(0);
    setCouponError(null);
  };

  const clear = () => {
    setLines([]);
    removeCoupon();
  };

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  return (
    <CartContext.Provider
      value={{
        lines,
        resolvedLines,
        count,
        subtotal,
        pricesLoaded,
        couponCode,
        discount,
        couponError,
        applyingCoupon: pending,
        addItem,
        removeItem,
        setQuantity,
        applyCoupon,
        removeCoupon,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
