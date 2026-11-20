"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type UserFormData = {
  fullname: string
  email: string
  role: "admin" | "staff"
}

async function readJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    throw new Error(`API tidak mengembalikan JSON (HTTP ${response.status}).`)
  }

  const result: unknown = await response.json()
  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : "Permintaan gagal."
    throw new Error(message)
  }
  return result
}

function isEditableUserResponse(
  result: unknown,
): result is { user: { fullname: string; email: string; role: "admin" | "staff" } } {
  if (typeof result !== "object" || result === null || !("user" in result)) return false
  const user = result.user
  return (
    typeof user === "object" &&
    user !== null &&
    "fullname" in user &&
    typeof user.fullname === "string" &&
    "email" in user &&
    typeof user.email === "string" &&
    "role" in user &&
    (user.role === "admin" || user.role === "staff")
  )
}

function isCreatedUserResponse(result: unknown): result is { user: { id: number } } {
  if (typeof result !== "object" || result === null || !("user" in result)) return false
  const user = result.user
  return (
    typeof user === "object" &&
    user !== null &&
    "id" in user &&
    typeof user.id === "number" &&
    Number.isSafeInteger(user.id) &&
    user.id > 0
  )
}

function isNextUserNumberResponse(result: unknown): result is { nextId: number } {
  return (
    typeof result === "object" &&
    result !== null &&
    "nextId" in result &&
    typeof result.nextId === "number" &&
    Number.isSafeInteger(result.nextId) &&
    result.nextId > 0
  )
}

export function UserForm({ userId }: { userId: string }) {
  const router = useRouter()
  const isNewUser = userId === "add"
  const [formData, setFormData] = useState<UserFormData>({
    fullname: "",
    email: "",
    role: "staff",
  })
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(!isNewUser)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [createdUserId, setCreatedUserId] = useState<number | null>(null)
  const [nextUserNumber, setNextUserNumber] = useState<number | null>(null)
  const [isLoadingNumber, setIsLoadingNumber] = useState(isNewUser)
  const [numberError, setNumberError] = useState("")

  useEffect(() => {
    if (isNewUser) return

    let active = true
    void fetch(`/api/users/${userId}`)
      .then(readJson)
      .then((result) => {
        if (!active || !isEditableUserResponse(result)) return
        setFormData({
          fullname: result.user.fullname,
          email: result.user.email,
          role: result.user.role,
        })
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Gagal memuat user.")
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [isNewUser, userId])

  useEffect(() => {
    if (!isNewUser) return

    let active = true
    void fetch("/api/users/next-id")
      .then(readJson)
      .then((result) => {
        if (!isNextUserNumberResponse(result)) {
          throw new Error("Respons API tidak menyertakan nomor user yang valid.")
        }
        if (active) setNextUserNumber(result.nextId)
      })
      .catch((loadError: unknown) => {
        if (active) {
          setNumberError(
            loadError instanceof Error ? loadError.message : "Gagal memuat nomor user.",
          )
        }
      })
      .finally(() => {
        if (active) setIsLoadingNumber(false)
      })

    return () => {
      active = false
    }
  }, [isNewUser])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSaving(true)

    const body: Record<string, string> = { ...formData }
    if (password) body.password = password

    try {
      const response = await fetch(isNewUser ? "/api/users" : `/api/users/${userId}`, {
        method: isNewUser ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const result = await readJson(response)
      if (isNewUser) {
        if (!isCreatedUserResponse(result)) {
          throw new Error("Respons API tidak menyertakan ID user yang valid.")
        }
        setCreatedUserId(result.user.id)
        return
      }

      router.push("/admin/usermanagement")
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan user.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <Card className="p-6">Memuat data user...</Card>
  }

  if (createdUserId !== null) {
    return (
      <Card className="max-w-xl space-y-4 p-6">
        <div role="status">
          <h2 className="text-lg font-semibold">User berhasil ditambahkan.</h2>
          <p className="mt-2">ID User: <strong>{createdUserId}</strong></p>
        </div>
        <Button type="button" onClick={() => router.push("/admin/usermanagement")}>
          Kembali ke daftar user
        </Button>
      </Card>
    )
  }

  return (
    <Card className="max-w-xl p-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {isNewUser && (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="next-user-number">
              Nomor otomatis (perkiraan)
            </label>
            <input
              id="next-user-number"
              className="w-full rounded-md border bg-muted px-3 py-2"
              readOnly
              value={
                isLoadingNumber
                  ? "Memuat nomor..."
                  : nextUserNumber ?? "Tidak tersedia"
              }
              aria-describedby="next-user-number-help"
            />
            <p id="next-user-number-help" className="text-xs text-muted-foreground">
              Nomor final ditentukan database saat user disimpan.
            </p>
            {numberError && (
              <p role="alert" className="text-sm text-destructive">{numberError}</p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="fullname">Nama lengkap</label>
          <input
            id="fullname"
            className="w-full rounded-md border px-3 py-2"
            autoComplete="name"
            required
            maxLength={191}
            value={formData.fullname}
            onChange={(event) => setFormData({ ...formData, fullname: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="w-full rounded-md border px-3 py-2"
            autoComplete="email"
            required
            maxLength={191}
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="role">Role</label>
          <select
            id="role"
            className="w-full rounded-md border px-3 py-2"
            value={formData.role}
            onChange={(event) =>
              setFormData({ ...formData, role: event.target.value as UserFormData["role"] })
            }
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password {isNewUser ? "" : "(kosongkan jika tidak diubah)"}
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-md border px-3 py-2"
            autoComplete={isNewUser ? "new-password" : "new-password"}
            minLength={8}
            maxLength={256}
            required={isNewUser}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/usermanagement")}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
