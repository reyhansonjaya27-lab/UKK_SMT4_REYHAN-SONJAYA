import { notFound } from "next/navigation"
import { UserForm } from "./user-form"

export default async function UserFormPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (id !== "add" && !/^[1-9]\d*$/.test(id)) notFound()

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">{id === "add" ? "Tambah user" : "Edit user"}</h1>
      <UserForm userId={id} />
    </div>
  )
}
