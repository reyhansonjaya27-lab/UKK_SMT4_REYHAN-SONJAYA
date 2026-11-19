type UserRole = "admin" | "staff"

export type UserInput = {
  fullname?: string
  email?: string
  password?: string
  role?: UserRole
}

export function parseUserInput(value: unknown, partial = false): { data?: UserInput; error?: string } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { error: "Data user tidak valid." }
  }

  const body = value as Record<string, unknown>
  const data: UserInput = {}

  if (!partial || "fullname" in body) {
    if (typeof body.fullname !== "string" || !body.fullname.trim() || body.fullname.trim().length > 191) {
      return { error: "Nama wajib diisi dan maksimal 191 karakter." }
    }
    data.fullname = body.fullname.trim()
  }

  if (!partial || "email" in body) {
    if (
      typeof body.email !== "string" ||
      body.email.trim().length > 191 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
    ) {
      return { error: "Email tidak valid." }
    }
    data.email = body.email.trim().toLowerCase()
  }

  if (!partial || "password" in body) {
    if (typeof body.password !== "string" || body.password.length < 8 || body.password.length > 256) {
      return { error: "Password harus berisi 8 sampai 256 karakter." }
    }
    data.password = body.password
  }

  if (!partial || "role" in body) {
    const role = body.role ?? "staff"
    if (role !== "admin" && role !== "staff") {
      return { error: "Role harus admin atau staff." }
    }
    data.role = role
  }

  if (partial && Object.keys(data).length === 0) {
    return { error: "Tidak ada data untuk diperbarui." }
  }

  return { data }
}
