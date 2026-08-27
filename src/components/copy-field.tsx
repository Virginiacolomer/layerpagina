"use client";

import { useState } from "react";

export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard no disponible (permiso denegado, contexto no seguro, etc.)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-2.5">
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="font-mono text-sm font-medium text-neutral-900">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-full border border-brand-gray-300 px-3 py-1 text-xs font-semibold text-neutral-700 transition hover:border-brand hover:text-brand"
      >
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
