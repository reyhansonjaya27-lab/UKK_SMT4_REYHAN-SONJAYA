import "server-only"
import { randomBytes, scrypt } from "node:crypto"
import { timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)

export async function hashUserPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  return `${derivedKey.toString("hex")}:${salt}`
}

export async function verifyUserPassword(password: string, storedHash: string) {
  const [hash, salt, extra] = storedHash.split(":")
  if (
    extra !== undefined ||
    !/^[\da-f]{128}$/i.test(hash ?? "") ||
    !/^[\da-f]{32}$/i.test(salt ?? "")
  ) {
    return false
  }

  const expected = Buffer.from(hash, "hex")
  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer
  return timingSafeEqual(actual, expected)
}
