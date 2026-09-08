// Franjas curvas en distintos tonos de gris de la paleta de marca, como
// decoración de fondo (ver identity board del cliente). Puramente decorativo.
export function WavyBackground() {
  return (
    <svg
      viewBox="0 0 1200 420"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <path
        d="M0,60 C200,10 400,110 600,70 C800,30 1000,90 1200,50 L1200,0 L0,0 Z"
        fill="var(--color-layer-gray-100)"
      />
      <path
        d="M0,140 C220,190 420,90 650,140 C850,180 1000,120 1200,150 L1200,0 L0,0 Z"
        fill="var(--color-layer-gray-200)"
        opacity={0.8}
      />
      <path
        d="M0,230 C250,180 450,260 700,220 C900,190 1050,240 1200,210 L1200,0 L0,0 Z"
        fill="var(--color-layer-gray-300)"
        opacity={0.6}
      />
      <path
        d="M0,320 C260,360 480,290 720,320 C920,345 1080,300 1200,320 L1200,420 L0,420 Z"
        fill="var(--color-layer-gray-400)"
        opacity={0.35}
      />
    </svg>
  );
}
