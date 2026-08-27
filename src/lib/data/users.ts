import bcrypt from "bcryptjs";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

type StoredUser = PublicUser & { passwordHash: string };

// In-memory store — temporary until a database is connected (see project
// plan). Resets whenever the dev server restarts; only meant to exercise the
// register/login/profile flow locally before swapping this for Prisma.
const users: StoredUser[] = [];
let nextId = 1;

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<PublicUser> {
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
  };
  users.push(user);
  return { id: user.id, name: user.name, email: user.email, phone: user.phone };
}

export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return { id: user.id, name: user.name, email: user.email, phone: user.phone };
}
