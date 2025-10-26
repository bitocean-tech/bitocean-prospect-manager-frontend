import { redirect } from "next/navigation"

export default function DashboardPage() {
  // Redireciona para a primeira página do menu por padrão
  redirect("/dashboard/buscar-negocios")
}
