import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"

const TOKEN_TTL_SECONDS = 60 * 60 * 8

type UserJwtPayload = {
  sub: string
  iat: number
  exp: number
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 bytes.")
  }
  return secret
}

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url")
}

export function createUserJwt(userId: number) {
  const now = Math.floor(Date.now() / 1000)
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = encodeBase64Url(
    JSON.stringify({ sub: String(userId), iat: now, exp: now + TOKEN_TTL_SECONDS }),
  )
  const content = `${header}.${payload}`
  const signature = createHmac("sha256", getJwtSecret()).update(content).digest("base64url")
  return `${content}.${signature}`
}

export function verifyUserJwt(token: string): UserJwtPayload | null {
  if (!token) return null

  const [headerPart, payloadPart, signaturePart, extraPart] = token.split(".")
  if (!headerPart || !payloadPart || !signaturePart || extraPart) return null

  const expectedSignature = createHmac("sha256", getJwtSecret())
    .update(`${headerPart}.${payloadPart}`)
    .digest()
  const providedSignature = Buffer.from(signaturePart, "base64url")
  if (
    providedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return null
  }

  try {
    const header = JSON.parse(Buffer.from(headerPart, "base64url").toString("utf8"))
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"))
    const now = Math.floor(Date.now() / 1000)

    if (
      header.alg !== "HS256" ||
      typeof payload.sub !== "string" ||
      !/^[1-9]\d*$/.test(payload.sub) ||
      !Number.isSafeInteger(Number(payload.sub)) ||
      !Number.isSafeInteger(payload.iat) ||
      !Number.isSafeInteger(payload.exp) ||
      payload.iat > now ||
      payload.exp <= now
    ) {
      return null
    }

    return { sub: payload.sub, iat: payload.iat, exp: payload.exp }
  } catch {
    return null
  }
}
