import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const TOKEN_NAME = "todo_token";
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_default_todo_app_secret_key_2026"
);

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
}

export async function signJWT(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(req?: NextRequest): Promise<TokenPayload | null> {
  let token: string | undefined;

  if (req) {
    // 1. Check HTTP-only cookie
    token = req.cookies.get(TOKEN_NAME)?.value;

    // 2. Check Authorization Header fallback (Bearer token)
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(TOKEN_NAME)?.value;
    } catch {
      return null;
    }
  }

  if (!token) return null;
  return await verifyJWT(token);
}
