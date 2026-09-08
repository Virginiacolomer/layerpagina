import "server-only";
import bcrypt from "bcryptjs";
import { prisma, isUniqueConstraintError } from "@/lib/db";

export type Role = "CUSTOMER" | "ADMIN";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
};

export type CustomerWithStats = PublicUser & {
  orderCount: number;
  totalSpent: number;
  lastPhone?: string;
};

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? undefined,
    role: user.role,
  };
}

// El admin del panel nunca se crea desde el registro público: se siembra una
// sola vez desde ADMIN_EMAIL/ADMIN_PASSWORD (env). El upsert es idempotente y
// además actualiza la contraseña si se cambió en el .env.
let adminSeeded = false;

async function ensureAdminSeeded() {
  if (adminSeeded) return;
  adminSeeded = true;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, role: "ADMIN", name: "Admin Layer" },
  });
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<PublicUser> {
  await ensureAdminSeeded();
  const email = input.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    const user = await prisma.user.create({
      data: { name: input.name, email, phone: input.phone, passwordHash, role: "CUSTOMER" },
    });
    return toPublicUser(user);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("Ya existe una cuenta con ese email.");
    }
    throw error;
  }
}

export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  await ensureAdminSeeded();
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user || !user.passwordHash) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return toPublicUser(user);
}

export async function getAllCustomers(): Promise<PublicUser[]> {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
  });
  return users.map(toPublicUser);
}

export async function getCustomersWithOrderStats(): Promise<CustomerWithStats[]> {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { orders: { orderBy: { createdAt: "desc" } } },
  });
  return users.map((user) => ({
    ...toPublicUser(user),
    orderCount: user.orders.length,
    totalSpent: user.orders.reduce((sum, order) => sum + Number(order.total), 0),
    lastPhone: user.orders[0]?.shippingPhone,
  }));
}
