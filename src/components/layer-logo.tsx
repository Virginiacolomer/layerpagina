// Isotipo real de Layer (public/logo-mark.svg), provisto por el cliente.
export function LayerMark({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- SVG decorativo simple, no necesita optimización de next/image
  return <img src="/logo-mark.svg" alt="" className={className} />;
}
