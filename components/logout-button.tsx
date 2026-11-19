"use client"

import { useRouter } from "next/navigation"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function LogoutButton() {
  const router = useRouter()

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (!response.ok) throw new Error("Gagal mengakhiri sesi.")
      router.push("/")
      router.refresh()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Gagal mengakhiri sesi.")
    }
  }

  return (
    <DropdownMenuItem variant="destructive" onSelect={(event) => {
      event.preventDefault()
      void logout()
    }}>
      Log out
    </DropdownMenuItem>
  )
}
