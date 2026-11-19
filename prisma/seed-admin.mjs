import "dotenv/config"
import { randomBytes, scrypt } from "node:crypto"
import { promisify } from "node:util"
import { createConnection } from "mariadb"

const databaseUrl = process.env.DATABASE_URL
const adminPassword = process.env.ADMIN_PASSWORD

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be configured in .env.")
}

if (!adminPassword || adminPassword.length < 8) {
  throw new Error("Set ADMIN_PASSWORD in .env to a value of at least 8 characters.")
}

const url = new URL(databaseUrl)
if (!["mysql:", "mariadb:"].includes(url.protocol)) {
  throw new Error("DATABASE_URL must use the mysql:// or mariadb:// protocol.")
}

const connection = await createConnection({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.replace(/^\/+/, "")),
})

try {
  const salt = randomBytes(16).toString("hex")
  const derivedKey = await promisify(scrypt)(adminPassword, salt, 64)
  const passwordHash = `${derivedKey.toString("hex")}:${salt}`

  await connection.query(
    `INSERT INTO users (fullname, email, password, role, updated_at)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3))
     ON DUPLICATE KEY UPDATE
       fullname = VALUES(fullname),
       password = VALUES(password),
       role = VALUES(role),
       updated_at = CURRENT_TIMESTAMP(3)`,
    ["reyhan", "reyhansonjaya27@gmail.com", passwordHash, "admin"],
  )

  console.log("Admin account is ready for reyhansonjaya27@gmail.com.")
} finally {
  await connection.end()
}
