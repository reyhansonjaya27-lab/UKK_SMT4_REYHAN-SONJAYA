import { NextResponse } from "next/server"
import { createUserJwt } from "@/lib/user-security"
import { getPrismaClient } from "@/lib/prisma"
import { verifyUserPassword } from "@/lib/password"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid." }, { status: 400 })
  }

  if (typeof body !== "object" || body === null || !("email" in body) || !("password" in body)) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 })
  }

  const email = body.email
  const password = body.password
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 })
  }

  try {
    const user = await getPrismaClient().user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, fullname: true, email: true, password: true, role: true },
    })

    if (!user || !(await verifyUserPassword(password, user.password))) {
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 })
    }

    const token = createUserJwt(user.id)
    await getPrismaClient().user.update({
      where: { id: user.id },
      data: { token },
    })

    const response = NextResponse.json({
      user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role },
    })
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    })
    return response
  } catch (error) {
    console.error("Login API failed.", error)
    return NextResponse.json({ error: "Login gagal diproses." }, { status: 500 })
  }
}
