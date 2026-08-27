import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = { title: "Crear cuenta | Layer" };

export default function RegistroPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-bold text-neutral-900">Crear cuenta</h1>
      <div className="mt-6">
        <RegisterForm />
      </div>
    </div>
  );
}
