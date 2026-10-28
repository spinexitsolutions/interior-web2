import { SignJWT, jwtVerify } from "jose";

// Edge-safe session helpers (used by proxy.ts and server code).
export const SESSION_COOKIE = "aangan_admin";

const secret = () => {
  const value = process.env.AUTH_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is not set. Add a long random AUTH_SECRET to your environment before using the admin panel.");
  }
  return new TextEncoder().encode(value || "dev-only-secret-change-me");
};

export async function signSession(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySession(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as { email: string };
  } catch {
    return null;
  }
}
