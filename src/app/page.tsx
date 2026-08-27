export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-brand-gray-100 px-6 text-center">
      <span className="rounded-full bg-brand px-4 py-1 text-sm font-semibold text-white">
        Sitio en construcción
      </span>
      <h1 className="text-5xl font-extrabold text-brand">Layer</h1>
      <p className="max-w-md text-lg text-neutral-700">
        Diseñamos en capas, pensamos en grande.
      </p>
    </div>
  );
}
