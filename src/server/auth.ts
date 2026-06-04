import crypto from "crypto";
import { User } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "scandesk-production-secure-signature-key-2026";

// Simple, secure salt-based password hashing using SHA-256
export function hashPassword(password: string): string {
  const salt = "scandesk_pepper_2026";
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Lightweight, pure-JS JWT token implementation
// It produces a fully compliant base64 payload structure that can be inspected or decodable anywhere
export function generateToken(user: User): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: user.id,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 // 7 days expiration
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signInput = `${headerB64}.${payloadB64}`;
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(signInput)
    .digest("base64url");

  return `${signInput}.${signature}`;
}

export function verifyToken(token: string): { sub: string; email: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signature] = parts;
    const signInput = `${headerB64}.${payloadB64}`;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(signInput)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode and check expiration
    const payloadStr = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadStr);

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Token expired
    }

    return {
      sub: payload.sub,
      email: payload.email
    };
  } catch (err) {
    return null;
  }
}
