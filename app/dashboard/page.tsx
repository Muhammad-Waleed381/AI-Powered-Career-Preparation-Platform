"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { SentientSphere } from "@/components/sentient-sphere"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import { 
  BookOpen, 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  LogOut,
  Bell,
  Settings,
  GraduationCap
} from "lucide-react"
import Link from "next/link"

const stats = [
  { label: "Total Students", value: "1,234", icon: Users, change: "+12%" },
  { label: "Active Courses", value: "24", icon: BookOpen, change: "+3" },
  { label: "Assignments", value: "156", icon: FileText, change: "+8" },
  { label: "Upcoming Events", value: "7", icon: Calendar, change: "2 this week" },
]

const recentActivities = [
  { id: 1, type: "assignment", title: "Math Assignment Submitted", time: "2 hours ago", student: "John Doe" },
  { id: 2, type: "course", title: "New Course Created: Web Development", time: "5 hours ago", student: "Admin" },
  { id: 3, type: "student", title: "New Student Registered", time: "1 day ago", student: "Jane Smith" },
  { id: 4, type: "assignment", title: "Physics Quiz Graded", time: "2 days ago", student: "Mike Johnson" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (!user) {
    return null
  }

  return (
    <SmoothScroll>
      <CustomCursor />
      <div className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
        {/* 3D Sphere Background */}
        <div className="absolute inset-0 opacity-20">
          <SentientSphere />
        </div>

        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 border-b border-white/10 bg-background/40 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-6 py-4 md:px-12 md:py-5">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-accent" />
              <span className="font-mono text-xs tracking-widest text-muted-foreground">EDUPLATFORM</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                data-cursor-hover
                className="relative p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </button>
              <button
                data-cursor-hover
                className="relative p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                data-cursor-hover
                onClick={handleLogout}
                className="px-4 py-2 rounded-full border border-white/20 font-mono text-xs tracking-wider text-muted-foreground hover:bg-white hover:text-black transition-colors duration-300 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="relative z-10 px-6 py-8 md:px-12 md:py-12">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">DASHBOARD</p>
            <h1 className="font-sans text-4xl md:text-5xl font-light tracking-tight mb-2">
              Welcome back, <span className="italic">{user.name || "User"}</span>
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              Here's what's happening with your education platform today.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="relative p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm hover:bg-background/50 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg border border-white/10 bg-background/50">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{stat.change}</span>
                  </div>
                  <h3 className="font-sans text-3xl font-light mb-1">{stat.value}</h3>
                  <p className="font-mono text-xs tracking-wider text-muted-foreground">{stat.label}</p>
                  <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-lg transition-colors duration-300" />
                </motion.div>
              )
            })}
          </div>

          {/* Charts and Activities Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="lg:col-span-2 p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">ANALYTICS</p>
                  <h2 className="font-sans text-2xl font-light">Performance Overview</h2>
                </div>
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>
              
              {/* Placeholder Chart */}
              <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg bg-background/20">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="font-mono text-xs text-muted-foreground">Chart visualization</p>
                </div>
              </div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">ACTIVITY</p>
                  <h2 className="font-sans text-2xl font-light">Recent</h2>
                </div>
                <Bell className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                    className="p-4 border border-white/5 rounded-lg hover:bg-background/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-sans text-sm font-light">{activity.title}</h4>
                      <span className="font-mono text-[10px] text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{activity.student}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-12"
          >
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-6">QUICK ACTIONS</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Add Course", icon: BookOpen, href: "#" },
                { label: "Manage Students", icon: Users, href: "#" },
                { label: "Create Assignment", icon: FileText, href: "#" },
                { label: "View Calendar", icon: Calendar, href: "#" },
              ].map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={action.label} href={action.href}>
                    <motion.button
                      data-cursor-hover
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm hover:bg-background/50 transition-all duration-300 flex flex-col items-center gap-3 group"
                    >
                      <div className="p-3 rounded-lg border border-white/10 bg-background/50 group-hover:border-accent transition-colors">
                        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                      <span className="font-mono text-xs tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                        {action.label}
                      </span>
                    </motion.button>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </SmoothScroll>
  )
}

