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
import { cartSubtotal, type CartLine } from "@/lib/cart";
import { checkCouponAction } from "@/lib/actions/cart-actions";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  couponCode: string | null;
  discount: number;
  couponError: string | null;
  applyingCoupon: boolean;
  addItem: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  setQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const LINES_KEY = "layer-cart";
const COUPON_KEY = "layer-cart-coupon";

function lineKey(productId: string, variantId?: string) {
  return `${productId}:${variantId ?? ""}`;
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

  const subtotal = useMemo(() => cartSubtotal(lines), [lines]);

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

  const addItem: CartContextValue["addItem"] = (productId, variantId, quantity) => {
    setLines((prev) => {
      const key = lineKey(productId, variantId);
      const existing = prev.find((l) => lineKey(l.productId, l.variantId) === key);
      if (existing) {
        return prev.map((l) =>
          lineKey(l.productId, l.variantId) === key
            ? { ...l, quantity: l.quantity + quantity }
            : l,
        );
      }
      return [...prev, { productId, variantId, quantity }];
    });
  };

  const removeItem: CartContextValue["removeItem"] = (productId, variantId) => {
    const key = lineKey(productId, variantId);
    setLines((prev) => prev.filter((l) => lineKey(l.productId, l.variantId) !== key));
  };

  const setQuantity: CartContextValue["setQuantity"] = (productId, variantId, quantity) => {
    const key = lineKey(productId, variantId);
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => lineKey(l.productId, l.variantId) !== key)
        : prev.map((l) => (lineKey(l.productId, l.variantId) === key ? { ...l, quantity } : l)),
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
        count,
        subtotal,
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
