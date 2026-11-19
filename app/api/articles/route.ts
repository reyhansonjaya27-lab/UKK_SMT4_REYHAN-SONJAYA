import { NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"

export async function GET() {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const articles = await getPrismaClient().artikel.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        isPublished: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ articles })
  } catch (error) {
    console.error("GET /api/articles failed.", error)
    return NextResponse.json({ error: "Gagal memuat artikel." }, { status: 500 })
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
      !("title" in body) ||
      typeof body.title !== "string" ||
      !("content" in body) ||
      typeof body.content !== "string"
    ) {
      return NextResponse.json({ error: "Judul dan isi artikel wajib diisi." }, { status: 400 })
    }

    const title = body.title.trim()
    const content = body.content.trim()
    if (!title || title.length > 191 || !content) {
      return NextResponse.json({ error: "Judul dan isi artikel wajib diisi." }, { status: 400 })
    }

    let categoryId: number | null = null
    if ("categoryId" in body && body.categoryId !== null && body.categoryId !== "") {
      const parsedCategoryId = Number(body.categoryId)
      if (!Number.isSafeInteger(parsedCategoryId) || parsedCategoryId < 1) {
        return NextResponse.json({ error: "Category artikel tidak valid." }, { status: 400 })
      }
      categoryId = parsedCategoryId
    }

    let isPublished = false
    if ("isPublished" in body) {
      if (typeof body.isPublished !== "boolean") {
        return NextResponse.json({ error: "Status publikasi tidak valid." }, { status: 400 })
      }
      isPublished = body.isPublished
    }

    const prisma = getPrismaClient()
    if (categoryId !== null) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      })
      if (!categoryExists) {
        return NextResponse.json({ error: "Category tidak ditemukan." }, { status: 400 })
      }
    }

    const article = await prisma.artikel.create({
      data: {
        title,
        content,
        categoryId,
        isPublished,
      },
      select: {
        id: true,
        title: true,
        content: true,
        isPublished: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ article }, { status: 201 })
  } catch (error) {
    console.error("POST /api/articles failed.", error)
    return NextResponse.json({ error: "Gagal menyimpan artikel." }, { status: 500 })
  }
}
