import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/require-admin"
import { getPrismaClient } from "@/lib/prisma"
import { hashUserPassword } from "@/lib/password"
import { parseUserInput } from "@/lib/user-input"

type RouteContext = { params: Promise<{ id: string }> }

function parseId(value: string) {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  )
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const id = parseId((await context.params).id)
    if (id === null) return NextResponse.json({ error: "ID user tidak valid." }, { status: 400 })

    const user = await getPrismaClient().user.findUnique({
      where: { id },
      select: { id: true, fullname: true, email: true, role: true, createdAt: true },
    })
    if (!user) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 })
    return NextResponse.json({ user })
  } catch (error) {
    console.error("GET /api/users/[id] failed.", error)
    return NextResponse.json({ error: "Gagal memuat user." }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const id = parseId((await context.params).id)
    if (id === null) return NextResponse.json({ error: "ID user tidak valid." }, { status: 400 })

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Format JSON tidak valid." }, { status: 400 })
    }

    const parsed = parseUserInput(body, true)
    if (!parsed.data || parsed.error) {
      return NextResponse.json({ error: parsed.error ?? "Data user tidak valid." }, { status: 400 })
    }

    const prisma = getPrismaClient()
    const existing = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } })
    if (!existing) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 })

    if (existing.role === "admin" && parsed.data.role === "staff") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } })
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Admin terakhir tidak dapat diubah menjadi staff." }, { status: 409 })
      }
    }

    const data: {
      fullname?: string
      email?: string
      password?: string
      role?: string
      token?: null
    } = {}
    if (parsed.data.fullname !== undefined) data.fullname = parsed.data.fullname
    if (parsed.data.email !== undefined) data.email = parsed.data.email
    if (parsed.data.role !== undefined) data.role = parsed.data.role
    if (parsed.data.password !== undefined) {
      data.password = await hashUserPassword(parsed.data.password)
      data.token = null
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data,
        select: { id: true, fullname: true, email: true, role: true, createdAt: true },
      })
      return NextResponse.json({ user })
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 })
      }
      throw error
    }
  } catch (error) {
    console.error("PATCH /api/users/[id] failed.", error)
    return NextResponse.json({ error: "Gagal memperbarui user." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const id = parseId((await context.params).id)
    if (id === null) return NextResponse.json({ error: "ID user tidak valid." }, { status: 400 })
    if (id === authorization.user.id) {
      return NextResponse.json({ error: "Akun yang sedang digunakan tidak dapat dihapus." }, { status: 409 })
    }

    const prisma = getPrismaClient()
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } })
    if (!user) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 })

    if (user.role === "admin") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } })
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Admin terakhir tidak dapat dihapus." }, { status: 409 })
      }
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/users/[id] failed.", error)
    return NextResponse.json({ error: "Gagal menghapus user." }, { status: 500 })
  }
}
