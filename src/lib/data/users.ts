import bcrypt from "bcryptjs";

export type Role = "CUSTOMER" | "ADMIN";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
};

type StoredUser = PublicUser & { passwordHash: string };

// In-memory store — temporary until a database is connected (see project
// plan). Resets whenever the dev server restarts; only meant to exercise the
// register/login/profile/admin flow locally before swapping this for Prisma.
const users: StoredUser[] = [];
let nextId = 1;
let adminSeeded = false;

// El registro público siempre crea CUSTOMER — el admin se siembra una sola
// vez desde ADMIN_EMAIL/ADMIN_PASSWORD (env), nunca queda expuesto como algo
// que un usuario pueda auto-asignarse.
async function ensureAdminSeeded() {
  if (adminSeeded) return;
  adminSeeded = true;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  if (users.some((u) => u.email === email)) return;
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({
    id: String(nextId++),
    name: "Admin Layer",
    email,
    passwordHash,
    role: "ADMIN",
  });
}

function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<PublicUser> {
  await ensureAdminSeeded();
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new Error("Ya existe una cuenta con ese email.");
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user: StoredUser = {
    id: String(nextId++),
    name: input.name.trim(),
    email,
    phone: input.phone,
    passwordHash,
    role: "CUSTOMER",
  };
  users.push(user);
  return toPublicUser(user);
}

export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  await ensureAdminSeeded();
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return toPublicUser(user);
}

export function getAllCustomers(): PublicUser[] {
  return users.filter((u) => u.role === "CUSTOMER").map(toPublicUser);
}
