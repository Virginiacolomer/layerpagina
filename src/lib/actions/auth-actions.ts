"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { createUser } from "@/lib/data/users";

export type FormState = { error: string } | undefined;

export async function loginAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/perfil",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos." };
    }
    throw error;
  }
}

export async function registerAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 6) {
    return { error: "Completá tu nombre, email y una contraseña de al menos 6 caracteres." };
  }

  try {
    await createUser({ name, email, password });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear la cuenta." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/perfil" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "La cuenta se creó, pero no se pudo iniciar sesión. Probá ingresar de nuevo." };
    }
    throw error;
  }
}
