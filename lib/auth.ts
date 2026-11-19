import { cookies } from "next/headers"
import { getPrismaClient } from "@/lib/prisma"
import { verifyUserJwt } from "@/lib/user-security"

export type AuthenticatedUser = {
  id: number
  fullname: string
  email: string
  role: string
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const token = (await cookies()).get("auth_token")?.value
  if (!token) return null
 
  const payload = verifyUserJwt(token)
  if (!payload) return null
 
  const userId = Number(payload.sub)
  if (!Number.isSafeInteger(userId) || userId < 1) return null
 
  const user = await getPrismaClient().user.findUnique({
    where: { id: userId },
    select: { id: true, fullname: true, email: true, role: true, token: true },
  })
  if (!user || user.token !== token) return null

  return {
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
  }
}