import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyUserCredentials } from "@/lib/data/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Detrás del proxy de Vercel el Host lo fija Vercel, así que es seguro
  // confiar en él. Sin esto Auth.js tira "UntrustedHost" y devuelve el error
  // genérico de "server configuration".
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  debug: process.env.AUTH_DEBUG === "true",
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;
        try {
          return await verifyUserCredentials(email, password);
        } catch (error) {
          console.error("[auth] authorize failed:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
      }
      return session;
    },
  },
});
