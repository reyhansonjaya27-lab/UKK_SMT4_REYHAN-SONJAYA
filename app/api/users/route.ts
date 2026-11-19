import { NextResponse, type NextRequest } from "next/server"
import { requireAdmin } from "@/lib/require-admin"
import { getPrismaClient } from "@/lib/prisma"
import { hashUserPassword } from "@/lib/password"
import { parseUserInput } from "@/lib/user-input"

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  )
}

export async function GET(request: NextRequest) {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const page = Number(request.nextUrl.searchParams.get("page") ?? "1")
    const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? "10")
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100
    ) {
      return NextResponse.json({ error: "Parameter pagination tidak valid." }, { status: 400 })
    }

    const prisma = getPrismaClient()
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: "desc" },
        select: {
          id: true,
          fullname: true,
          email: true,
          role: true,
          token: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ])

    return NextResponse.json({
      users: users.map(({ token, ...user }) => ({ ...user, hasToken: Boolean(token) })),
      pagination: { totalUsers, page },
    })
  } catch (error) {
    console.error("GET /api/users failed.", error)
    return NextResponse.json({ error: "Gagal memuat user." }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Format JSON tidak valid." }, { status: 400 })
    }

    const parsed = parseUserInput(body)
    if (!parsed.data || parsed.error) {
      return NextResponse.json({ error: parsed.error ?? "Data user tidak valid." }, { status: 400 })
    }

    try {
      const user = await getPrismaClient().user.create({
        data: {
          fullname: parsed.data.fullname!,
          email: parsed.data.email!,
          password: await hashUserPassword(parsed.data.password!),
          role: parsed.data.role!,
        },
        select: { id: true, fullname: true, email: true, role: true, createdAt: true },
      })
      return NextResponse.json({ user }, { status: 201 })
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 })
      }
      throw error
    }
  } catch (error) {
    console.error("POST /api/users failed.", error)
    return NextResponse.json({ error: "Gagal membuat user." }, { status: 500 })
  }
}
