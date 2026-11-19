import "server-only"
import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"

export async function requireAdmin() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 }),
    }
  }

  if (user.role !== "admin") {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: "Akses hanya untuk admin." }, { status: 403 }),
    }
  }

  return { authorized: true as const, user }
}
