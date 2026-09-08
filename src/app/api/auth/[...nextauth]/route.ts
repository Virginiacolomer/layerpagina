import { handlers } from "@/auth";

// Envoltura temporal de diagnóstico: si el handler de Auth.js tira, devolvemos
// el error real en el body en vez de la página genérica de "server
// configuration". Quitar cuando el login funcione en producción.
function withErrorDetail<Req>(handler: (req: Req) => Promise<Response> | Response) {
  return async (req: Req) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error("[auth route] error:", error);
      const detail =
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack, cause: String(error.cause ?? "") }
          : { message: String(error) };
      return new Response(JSON.stringify({ authRouteError: detail }, null, 2), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
  };
}

export const GET = withErrorDetail(handlers.GET);
export const POST = withErrorDetail(handlers.POST);
