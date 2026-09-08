import { hexForColor } from "@/lib/colors";

// Lista compacta de colores elegidos, con su muestra. Se usa en el carrito,
// checkout, confirmación de pedido y panel de admin.
export function ColorList({
  colors,
  className = "",
}: {
  colors: string[];
  className?: string;
}) {
  if (colors.length === 0) return null;
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      {colors.map((name, i) => (
        <span key={`${name}-${i}`} className="inline-flex items-center gap-1 text-sm text-neutral-600">
          <span
            className="inline-block h-3 w-3 rounded-full border border-black/10"
            style={{ backgroundColor: hexForColor(name) }}
            aria-hidden
          />
          {name}
        </span>
      ))}
    </span>
  );
}
