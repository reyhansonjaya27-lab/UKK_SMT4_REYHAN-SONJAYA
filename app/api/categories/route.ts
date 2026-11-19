import { NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"

export async function GET() {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const categories = await getPrismaClient().category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, createdAt: true },
    })
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("GET /api/categories failed.", error)
    return NextResponse.json({ error: "Gagal memuat category." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Format JSON tidak valid." }, { status: 400 })
    }

    if (typeof body !== "object" || body === null || !("name" in body) || typeof body.name !== "string") {
      return NextResponse.json({ error: "Nama category wajib diisi." }, { status: 400 })
    }
    const name = body.name.trim()
    if (!name || name.length > 191) {
      return NextResponse.json({ error: "Nama category wajib diisi dan maksimal 191 karakter." }, { status: 400 })
    }

    const category = await getPrismaClient().category.create({
      data: { name },
      select: { id: true, name: true, createdAt: true },
    })
    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("POST /api/categories failed.", error)
    return NextResponse.json({ error: "Gagal menyimpan category." }, { status: 500 })
  }
}
