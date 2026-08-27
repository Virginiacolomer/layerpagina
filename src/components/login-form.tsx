"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth-actions";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {callbackUrl && <input type="hidden" name="redirectTo" value={callbackUrl} />}
      <div>
        <label htmlFor="email" className="text-sm font-medium text-neutral-800">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-neutral-800">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-brand px-6 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>

      <p className="text-sm text-neutral-600">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="font-medium text-brand hover:underline">
          Creá una
        </Link>
      </p>
    </form>
  );
}
