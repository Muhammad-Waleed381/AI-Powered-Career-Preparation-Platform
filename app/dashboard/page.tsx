"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { SentientSphere } from "@/components/sentient-sphere"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import { JobMatchDonut } from "@/components/charts/job-match-donut"
import { SkillsRadar } from "@/components/charts/skills-radar"
import { ApplicationProgress } from "@/components/charts/application-progress"
import { MatchTrendChart } from "@/components/charts/match-trend-chart"
import {
  Briefcase,
  Calendar,
  TrendingUp,
  LogOut,
  Bell,
  Settings,
  Target,
  FileSearch,
  Search,
  BarChart3,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"

const jobActivities = [
  {
    id: 1,
    title: "Senior Developer - Google",
    subtitle: "92% match",
    time: "Sep 08",
    status: "applied",
    icon: CheckCircle2
  },
  {
    id: 2,
    title: "Research Completed - Amazon",
    subtitle: "12 questions ready",
    time: "Sep 07",
    status: "research",
    icon: FileSearch
  },
  {
    id: 3,
    title: "Frontend Engineer - Meta",
    subtitle: "85% match",
    time: "Sep 07",
    status: "saved",
    icon: Briefcase
  },
  {
    id: 4,
    title: "Skills Updated - React Advanced",
    subtitle: "+5% match score",
    time: "Sep 06",
    status: "skill",
    icon: TrendingUp
  },
]

const weeklyProgress = [
  { label: "Applications", value: 12, max: 20, color: "purple" },
  { label: "Interviews", value: 3, max: 5, color: "blue" },
  { label: "Research", value: 5, max: 10, color: "green" },
  { label: "Skills Improved", value: 2, max: 3, color: "orange" },
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
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-accent" />
                <span className="font-mono text-xs tracking-widest text-foreground font-semibold">JOBMATCHER</span>
              </div>

              {/* Header Stats */}
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">Applications:</span>
                  <span className="font-mono text-sm text-foreground font-medium">42</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">Interviews:</span>
                  <span className="font-mono text-sm text-foreground font-medium">8</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">Match Score:</span>
                  <span className="font-mono text-sm text-purple-400 font-medium">87%</span>
                </div>
              </div>
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
              Welcome, <span className="italic">{user.name || "Daniel"}</span>!
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              Your career preparation dashboard - track applications, improve skills, and land your dream job.
            </p>
          </motion.div>

          {/* Main Stats Area - 3 Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
            >
              <JobMatchDonut score={87} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
            >
              <ApplicationProgress current={42} goal={100} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
            >
              <SkillsRadar />
            </motion.div>
          </div>

          {/* Job Activity and Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Job Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="lg:col-span-2 p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">RECENT</p>
                  <h2 className="font-sans text-2xl font-light">Job Activity</h2>
                </div>
                <Briefcase className="w-6 h-6 text-muted-foreground" />
              </div>

              <div className="space-y-3">
                {jobActivities.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 border border-white/5 rounded-lg hover:bg-background/20 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <Icon className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans text-sm font-light truncate">{activity.title}</h4>
                        <p className="font-mono text-xs text-muted-foreground">{activity.subtitle}</p>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Weekly Progress Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">THIS WEEK</p>
                  <h2 className="font-sans text-2xl font-light">Progress</h2>
                </div>
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                {weeklyProgress.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-muted-foreground">{item.label}</span>
                      <span className="font-mono text-xs text-foreground">
                        {item.value}/{item.max}
                      </span>
                    </div>
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / item.max) * 100}%` }}
                        transition={{ duration: 1, delay: 0.9 + index * 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Application Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm mb-12"
          >
            <MatchTrendChart />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-6">QUICK ACTIONS</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Scan New Jobs", icon: Search, href: "/dashboard/job", desc: "Job scraping" },
                { label: "Analyze Resume", icon: FileSearch, href: "#", desc: "PDF parsing" },
                { label: "Research Role", icon: Target, href: "#", desc: "AI pipeline" },
                { label: "View Insights", icon: BarChart3, href: "#", desc: "Analytics" },
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
                      <div className="p-3 rounded-lg border border-white/10 bg-background/50 group-hover:border-purple-500/50 transition-colors">
                        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                      </div>
                      <div className="text-center">
                        <span className="font-mono text-xs tracking-wider text-muted-foreground group-hover:text-foreground transition-colors block">
                          {action.label}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground/50 block mt-1">
                          {action.desc}
                        </span>
                      </div>
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

