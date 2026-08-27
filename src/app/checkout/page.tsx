import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Checkout | Layer" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/checkout");

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold text-neutral-900">Finalizar compra</h1>
      <CheckoutForm defaultName={session.user.name ?? ""} />
    </div>
  );
}
