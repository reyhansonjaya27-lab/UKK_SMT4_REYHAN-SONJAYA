import { NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"

type AutoIncrementRow = {
  nextId: bigint | number | null
}

export async function GET() {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const rows = await getPrismaClient().$queryRaw<AutoIncrementRow[]>`
      SELECT AUTO_INCREMENT AS nextId
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
    `
    const nextId = Number(rows[0]?.nextId)
    if (!Number.isSafeInteger(nextId) || nextId < 1) {
      throw new Error("The users table did not return a valid auto-increment value.")
    }

    return NextResponse.json({ nextId })
  } catch (error) {
    console.error("GET /api/users/next-id failed.", error)
    return NextResponse.json({ error: "Gagal memuat nomor user." }, { status: 500 })
  }
}
