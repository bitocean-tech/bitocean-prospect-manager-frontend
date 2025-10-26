import { AppLayout } from "@/common/components/AppLayout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}