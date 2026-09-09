"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Foto que aparece y desaparece suavemente según su posición en la pantalla,
// con los bordes difuminados (máscara radial).
export function ScrollFadeImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ opacity: 1, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      // 0 cuando el elemento está centrado en la ventana, 1 en los bordes
      const dist = Math.min(1, Math.abs(center - vh / 2) / (vh / 2 + rect.height / 2));
      const opacity = Math.max(0, Math.min(1, 1.35 - dist * 1.7));
      setT({ opacity, y: (1 - opacity) * 20 });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const mask =
    "radial-gradient(ellipse 76% 78% at 50% 50%, #000 38%, rgba(0,0,0,0.35) 74%, transparent 100%)";

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-[16/10] w-full max-w-3xl overflow-hidden transition-[opacity,transform] duration-300 ease-out motion-reduce:!opacity-100 motion-reduce:!transform-none"
      style={{
        opacity: t.opacity,
        transform: `translateY(${t.y}px)`,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 768px, 100vw"
        className="object-cover"
      />
    </div>
  );
}
