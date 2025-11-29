import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-[#050505]">
            <DashboardSidebar />
            <div className="flex-1">{children}</div>
        </div>
    )
}
