import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { verifyUserJwt } from "@/lib/user-security"

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  let databaseError = false

  if (token) {
    try {
      const payload = verifyUserJwt(token)
      const userId = Number(payload?.sub)
      if (Number.isSafeInteger(userId) && userId > 0) {
        await getPrismaClient().user.updateMany({
          where: { id: userId, token },
          data: { token: null },
        })
      }
    } catch (error) {
      databaseError = true
      console.error("Logout token revocation failed.", error)
    }
  }

  cookieStore.delete("auth_token")
  if (databaseError) {
    return NextResponse.json({ error: "Token lokal dihapus, tetapi sesi database belum dicabut." }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
