"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Category = { id: number; name: string; createdAt: string }

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
  return (
    typeof result === "object" &&
    result !== null &&
    "categories" in result &&
    Array.isArray(result.categories)
  )
}

async function fetchCategories() {
  const result = await readApiResponse(await fetch("/api/categories"))
  if (!isCategoryList(result)) throw new Error("Format data category tidak valid.")
  return result.categories
}

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const loadCategories = useCallback(async () => {
    setError("")
    try {
      setCategories(await fetchCategories())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat category.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchCategories()
      .then((result) => {
        if (active) setCategories(result)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Gagal memuat category.")
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
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }),
      )
      setName("")
      await loadCategories()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan category.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="m-6 p-6">
      <h1 className="mb-1 text-2xl font-bold">Category</h1>
      <p className="mb-5 text-sm text-muted-foreground">Tambah kategori artikel.</p>

      <form className="mb-6 flex max-w-xl gap-2" onSubmit={handleSubmit}>
        <input
          aria-label="Nama category"
          className="min-w-0 flex-1 rounded-md border px-3 py-2"
          maxLength={191}
          placeholder="Nama category"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Tambah"}
        </Button>
      </form>

      {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Nama category</TableHead>
            <TableHead>Dibuat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={3} className="text-center">Memuat category...</TableCell></TableRow>
          ) : categories.length === 0 ? (
            <TableRow><TableCell colSpan={3} className="text-center">Belum ada category.</TableCell></TableRow>
          ) : categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.id}</TableCell>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>{new Date(category.createdAt).toLocaleDateString("id-ID")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
