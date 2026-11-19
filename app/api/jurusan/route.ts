import { NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"

export async function GET() {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const jurusan = await getPrismaClient().jurusan.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true, createdAt: true },
    })
    return NextResponse.json({ jurusan })
  } catch (error) {
    console.error("GET /api/jurusan failed.", error)
    return NextResponse.json({ error: "Gagal memuat jurusan." }, { status: 500 })
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

    if (
      typeof body !== "object" ||
      body === null ||
      !("name" in body) ||
      typeof body.name !== "string" ||
      !("description" in body) ||
      typeof body.description !== "string"
    ) {
      return NextResponse.json({ error: "Nama dan deskripsi jurusan wajib diisi." }, { status: 400 })
    }

    const name = body.name.trim()
    const description = body.description.trim()
    if (!name || name.length > 191 || !description) {
      return NextResponse.json({ error: "Nama dan deskripsi jurusan wajib diisi." }, { status: 400 })
    }

    const jurusan = await getPrismaClient().jurusan.create({
      data: { name, description },
      select: { id: true, name: true, description: true, createdAt: true },
    })
    return NextResponse.json({ jurusan }, { status: 201 })
  } catch (error) {
    console.error("POST /api/jurusan failed.", error)
    return NextResponse.json({ error: "Gagal menyimpan jurusan." }, { status: 500 })
  }
}
