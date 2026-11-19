"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Category = { id: number; name: string }
type Article = {
  id: number
  title: string
  content: string
  isPublished: boolean
  createdAt: string
  category: Category | null
}

async function readApiResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    throw new Error(`API tidak mengembalikan JSON (HTTP ${response.status}).`)
  }
  const result: unknown = await response.json()
  if (!response.ok) {
    const message =
      typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
        ? result.error
        : "Permintaan gagal."
    throw new Error(message)
  }
  return result
}

function isCategoryList(result: unknown): result is { categories: Category[] } {
  return typeof result === "object" && result !== null && "categories" in result && Array.isArray(result.categories)
}

function isArticleList(result: unknown): result is { articles: Article[] } {
  return typeof result === "object" && result !== null && "articles" in result && Array.isArray(result.articles)
}

async function fetchArticleData() {
  const [categoryResult, articleResult] = await Promise.all([
    fetch("/api/categories").then(readApiResponse),
    fetch("/api/articles").then(readApiResponse),
  ])
  if (!isCategoryList(categoryResult) || !isArticleList(articleResult)) {
    throw new Error("Format data artikel tidak valid.")
  }
  return { categories: categoryResult.categories, articles: articleResult.articles }
}

export default function ArtikelAdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const loadData = useCallback(async () => {
    setError("")
    try {
      const data = await fetchArticleData()
      setCategories(data.categories)
      setArticles(data.articles)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat artikel.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchArticleData()
      .then((data) => {
        if (!active) return
        setCategories(data.categories)
        setArticles(data.articles)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Gagal memuat artikel.")
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSaving(true)
    try {
      await readApiResponse(
        await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            categoryId: categoryId || null,
            isPublished,
          }),
        }),
      )
      setTitle("")
      setContent("")
      setCategoryId("")
      setIsPublished(false)
      await loadData()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan artikel.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="m-6 p-6">
      <h1 className="mb-1 text-2xl font-bold">Artikel</h1>
      <p className="mb-5 text-sm text-muted-foreground">Buat artikel dan hubungkan dengan category.</p>

      <form className="mb-6 grid max-w-2xl gap-3" onSubmit={handleSubmit}>
        <input
          aria-label="Judul artikel"
          className="w-full rounded-md border px-3 py-2"
          maxLength={191}
          placeholder="Judul artikel"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <select
          aria-label="Category artikel"
          className="w-full rounded-md border px-3 py-2"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">Tanpa category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <textarea
          aria-label="Isi artikel"
          className="min-h-40 w-full rounded-md border px-3 py-2"
          placeholder="Isi artikel"
          required
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
          />
          Publikasikan artikel
        </label>
        <div><Button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan..." : "Tambah artikel"}</Button></div>
      </form>

      {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dibuat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={5} className="text-center">Memuat artikel...</TableCell></TableRow>
          ) : articles.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center">Belum ada artikel.</TableCell></TableRow>
          ) : articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell>{article.id}</TableCell>
              <TableCell className="font-medium">{article.title}</TableCell>
              <TableCell>{article.category?.name ?? "-"}</TableCell>
              <TableCell>{article.isPublished ? "Published" : "Draft"}</TableCell>
              <TableCell>{new Date(article.createdAt).toLocaleDateString("id-ID")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
