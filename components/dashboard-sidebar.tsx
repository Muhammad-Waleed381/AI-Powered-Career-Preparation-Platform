"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        label: "Resume Analysis",
        icon: FileText,
        href: "/dashboard/resume-analysis",
    },
    {
        label: "Job Discovery",
        icon: Briefcase,
        href: "/dashboard/job-discovery",
    },
    {
        label: "Interview Prep",
        icon: MessageSquare,
        href: "/dashboard/interview-prep",
    },
]

export function DashboardSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()

    return (
        <motion.aside
            initial={false}
            animate={{
                width: isCollapsed ? 80 : 240,
            }}
            transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="relative border-r border-white/10 bg-background/40 backdrop-blur-sm"
        >
            <div className="flex h-full flex-col">
                {/* Toggle Button */}
                <div className="flex items-center justify-end p-4">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="rounded-lg border border-white/10 p-2 hover:bg-white/5 transition-colors"
                        data-cursor-hover
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 px-3 py-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200",
                                        isActive
                                            ? "bg-white/10 text-foreground"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    )}
                                    data-cursor-hover
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    <AnimatePresence mode="wait">
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="font-mono text-xs tracking-wider whitespace-nowrap overflow-hidden"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        )
                    })}
                </nav>

                {/* User Profile Section at Bottom */}
                <div className="border-t border-white/10 p-4">
                    <div
                        className={cn(
                            "flex items-center gap-3",
                            isCollapsed && "justify-center"
                        )}
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <span className="font-mono text-xs font-bold">D</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <p className="font-mono text-xs font-medium">Daniel Lewis</p>
                                    <p className="font-mono text-[10px] text-muted-foreground">
                                        @daniellewis02
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.aside>
    )
}
