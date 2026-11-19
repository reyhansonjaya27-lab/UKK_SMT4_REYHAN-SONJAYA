"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Jurusan = { id: number; name: string; description: string; createdAt: string }

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

function isJurusanList(result: unknown): result is { jurusan: Jurusan[] } {
  return typeof result === "object" && result !== null && "jurusan" in result && Array.isArray(result.jurusan)
}

async function fetchJurusan() {
  const result = await readApiResponse(await fetch("/api/jurusan"))
  if (!isJurusanList(result)) throw new Error("Format data jurusan tidak valid.")
  return result.jurusan
}

export default function JurusanAdminPage() {
  const [jurusan, setJurusan] = useState<Jurusan[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const loadJurusan = useCallback(async () => {
    setError("")
    try {
      setJurusan(await fetchJurusan())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat jurusan.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchJurusan()
      .then((result) => {
        if (active) setJurusan(result)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Gagal memuat jurusan.")
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
        await fetch("/api/jurusan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        }),
      )
      setName("")
      setDescription("")
      await loadJurusan()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan jurusan.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="m-6 p-6">
      <h1 className="mb-1 text-2xl font-bold">Jurusan</h1>
      <p className="mb-5 text-sm text-muted-foreground">Tambah program keahlian.</p>

      <form className="mb-6 grid max-w-2xl gap-3" onSubmit={handleSubmit}>
        <input
          aria-label="Nama jurusan"
          className="w-full rounded-md border px-3 py-2"
          maxLength={191}
          placeholder="Nama jurusan"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <textarea
          aria-label="Deskripsi jurusan"
          className="min-h-24 w-full rounded-md border px-3 py-2"
          placeholder="Deskripsi jurusan"
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div><Button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan..." : "Tambah jurusan"}</Button></div>
      </form>

      {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Nama jurusan</TableHead>
            <TableHead>Deskripsi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={3} className="text-center">Memuat jurusan...</TableCell></TableRow>
          ) : jurusan.length === 0 ? (
            <TableRow><TableCell colSpan={3} className="text-center">Belum ada jurusan.</TableCell></TableRow>
          ) : jurusan.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
