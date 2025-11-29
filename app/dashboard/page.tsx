"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import { JobMatchDonut } from "@/components/charts/job-match-donut"
import { SkillsRadar } from "@/components/charts/skills-radar"
import { SkillProficiency } from "@/components/charts/skill-proficiency"
import { ExperienceTimeline } from "@/components/charts/experience-timeline"
import { SkillsDistribution } from "@/components/charts/skills-distribution"
import { ApplicationProgress } from "@/components/charts/application-progress"
import { MatchTrendChart } from "@/components/charts/match-trend-chart"
import {
  Briefcase,
  TrendingUp,
  LogOut,
  Bell,
  Settings,
  Target,
  FileSearch,
  Search,
  BarChart3,
  CheckCircle2,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { JobMatch } from "@/lib/job-matching-service"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [jobs, setJobs] = useState<JobMatch[]>([])
  const [interviewSessions, setInterviewSessions] = useState<any[]>([])

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const userObj = JSON.parse(userData)
    setUser(userObj)

    // Load resume profile - try both formats
    const profileKey = localStorage.getItem(`profile_${userObj.email}`)
    const resumeProfile = localStorage.getItem("resumeProfile")
    
    let loadedProfile = null
    
    // Try database format first (profile_${email})
    if (profileKey) {
      try {
        loadedProfile = JSON.parse(profileKey)
        setProfile(loadedProfile)
      } catch (e) {
        console.error("Error parsing profile:", e)
      }
    }
    
    // If not found, try display format (resumeProfile)
    if (!loadedProfile && resumeProfile) {
      try {
        const parsed = JSON.parse(resumeProfile)
        // Convert display format to database format for consistency
        const convertedProfile = {
          email: parsed.personalInfo?.email || userObj.email,
          full_name: parsed.personalInfo?.name || userObj.name || userObj.email.split('@')[0],
          phone: parsed.personalInfo?.phone || '',
          location: parsed.personalInfo?.location || '',
          linkedin_url: parsed.personalInfo?.linkedin || undefined,
          github_url: parsed.personalInfo?.github || undefined,
          portfolio_url: parsed.personalInfo?.portfolio || undefined,
          summary: parsed.summary || '',
          skills: parsed.skills || { technical: [], languages: [], frameworks: [], tools: [], soft: [] },
          experience: parsed.experience || [],
          education: parsed.education || [],
          certifications: parsed.certifications || [],
          projects: parsed.projects || [],
          skill_proficiency: parsed.analysis?.skillProficiency || [],
          top_strengths: parsed.analysis?.topStrengths || [],
          experience_level: parsed.analysis?.experienceLevel || 'mid',
          total_years_experience: parsed.analysis?.totalYearsExperience || 0,
          updated_at: new Date().toISOString(),
        }
        setProfile(convertedProfile)
        // Also save in database format for future use
        localStorage.setItem(`profile_${userObj.email}`, JSON.stringify(convertedProfile))
      } catch (e) {
        console.error("Error parsing resumeProfile:", e)
      }
    }

    // Load jobs from localStorage (stored by job discovery page)
    const savedJobs = localStorage.getItem(`jobs_${userObj.email}`)
    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs))
      } catch (e) {
        console.error("Error parsing jobs:", e)
      }
    }

    // Load interview prep sessions
    const savedSessions = localStorage.getItem(`interview_sessions_${userObj.email}`)
    if (savedSessions) {
      try {
        setInterviewSessions(JSON.parse(savedSessions))
      } catch (e) {
        console.error("Error parsing interview sessions:", e)
      }
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  // Calculate real stats from resume
  const totalSkills = profile 
    ? (profile.skills?.technical?.length || 0) + 
      (profile.skills?.frameworks?.length || 0) + 
      (profile.skills?.tools?.length || 0)
    : 0
  const totalExperience = profile?.experience?.length || 0
  const totalProjects = profile?.projects?.length || 0
  const yearsExperience = profile?.total_years_experience || 0
  const experienceLevel = profile?.experience_level || 'N/A'
  
  // Calculate real stats from jobs
  const totalJobs = jobs.length
  const avgMatchScore = jobs.length > 0
    ? Math.round(jobs.reduce((sum, job) => sum + job.matchScore, 0) / jobs.length)
    : 0
  const topJobs = jobs
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
    .map((job, idx) => ({
      id: idx + 1,
      title: `${job.job.title} - ${job.job.company}`,
      subtitle: `${job.matchScore}% match`,
      time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: "job",
      icon: Briefcase,
      matchScore: job.matchScore
    }))

  const interviewActivities = interviewSessions.slice(0, 3).map((session, idx) => ({
    id: `interview_${idx}`,
    title: `Research: ${session.company || 'Company'} - ${session.role || 'Role'}`,
    subtitle: `${session.questions?.technical?.length || 0} questions ready`,
    time: session.created_at 
      ? new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    status: "research",
    icon: FileSearch
  }))

  const jobActivities = [...topJobs, ...interviewActivities].slice(0, 5)

  if (!user) {
    return null
  }

  return (
    <SmoothScroll>
      <CustomCursor />
      <div className="relative min-h-screen w-full overflow-hidden bg-background">

        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-6 py-4 md:px-12 md:py-5">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-accent" />
                <span className="font-mono text-xs tracking-widest text-foreground font-semibold">JOBMATCHER</span>
              </div>

              {/* Header Stats */}
              <div className="hidden md:flex items-center gap-6">
                {profile && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">Skills:</span>
                      <span className="font-mono text-sm text-foreground font-medium">{totalSkills}</span>
                    </div>
                    <div className="h-4 w-px bg-border/50" />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">Experience:</span>
                      <span className="font-mono text-sm text-foreground font-medium">{yearsExperience} yrs</span>
                    </div>
                    <div className="h-4 w-px bg-border/50" />
                  </>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">Jobs Found:</span>
                  <span className="font-mono text-sm text-foreground font-medium">{totalJobs}</span>
                </div>
                {avgMatchScore > 0 && (
                  <>
                    <div className="h-4 w-px bg-border/50" />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">Avg Match:</span>
                      <span className="font-mono text-sm text-accent font-medium">{avgMatchScore}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                data-cursor-hover
                className="relative p-2 rounded-full border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </button>
              <button
                data-cursor-hover
                className="relative p-2 rounded-full border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                data-cursor-hover
                onClick={handleLogout}
                className="px-4 py-2 rounded-full border border-border font-mono text-xs tracking-wider text-muted-foreground hover:bg-foreground hover:text-background transition-colors duration-300 flex items-center gap-2"
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
            className="mb-8"
          >
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">DASHBOARD</p>
            <h1 className="font-sans text-4xl md:text-5xl font-light tracking-tight mb-2">
              Welcome, <span className="italic">{profile?.full_name || user.name || "User"}</span>!
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              {profile 
                ? `${experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)} level developer with ${yearsExperience} years of experience • ${totalSkills} skills • ${totalProjects} projects`
                : "Your career preparation dashboard - track applications, improve skills, and land your dream job."
              }
            </p>
          </motion.div>

          {/* Main Stats Area - Charts Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {avgMatchScore > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm min-h-[400px]"
              >
                <JobMatchDonut score={avgMatchScore} />
              </motion.div>
            )}

            {profile && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="relative p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm min-h-[400px]"
                >
                  <SkillsRadar profile={profile} />
                </motion.div>

                {avgMatchScore === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="relative p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm min-h-[400px]"
                  >
                    <SkillsDistribution profile={profile} />
                  </motion.div>
                )}
              </>
            )}

            {!profile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm min-h-[400px] md:col-span-2"
              >
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <FileSearch className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="font-mono text-sm text-muted-foreground mb-2">No Resume Data</p>
                  <p className="font-mono text-xs text-muted-foreground/50 text-center">
                    Upload your resume to see personalized insights
                  </p>
                  <Link href="/dashboard/resume-analysis">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4 px-4 py-2 border border-border rounded-lg font-mono text-xs hover:bg-accent/10 transition-colors"
                    >
                      Upload Resume
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          {/* Charts Row 2 - Resume Details */}
          {profile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="relative p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm min-h-[400px]"
              >
                <SkillProficiency profile={profile} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="relative p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm min-h-[400px]"
              >
                <ExperienceTimeline profile={profile} />
              </motion.div>
            </div>
          )}

          {/* Charts Row 3 - Skills Distribution (if no match score) */}
          {profile && avgMatchScore === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="relative p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm min-h-[400px] mb-6"
            >
              <SkillsDistribution profile={profile} />
            </motion.div>
          )}

          {/* Monthly Goal - Full Width */}
          {jobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="relative p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm min-h-[400px] mb-6"
            >
              <ApplicationProgress jobs={jobs} />
            </motion.div>
          )}

          {/* Match Trend Chart */}
          {jobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm mb-12 min-h-[450px]"
            >
              <MatchTrendChart jobs={jobs} />
            </motion.div>
          )}

          {/* Job Activity Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="p-6 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">RECENT</p>
                <h2 className="font-sans text-2xl font-light">Activity</h2>
              </div>
              <Briefcase className="w-6 h-6 text-muted-foreground" />
            </div>

            {jobActivities.length > 0 ? (
              <div className="space-y-3">
                {jobActivities.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 border border-border/30 rounded-lg hover:bg-muted/30 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                        <Icon className="w-4 h-4 text-accent" />
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
            ) : (
              <div className="text-center py-8">
                <p className="font-mono text-sm text-muted-foreground mb-4">No recent activity</p>
                <p className="font-mono text-xs text-muted-foreground/50">
                  Start by discovering jobs or preparing for interviews
                </p>
              </div>
            )}
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
                { label: "Discover Jobs", icon: Search, href: "/dashboard/job", desc: "Find matches" },
                { label: "Analyze Resume", icon: FileSearch, href: "/dashboard/resume-analysis", desc: "Upload CV" },
                { label: "Interview Prep", icon: MessageSquare, href: "/dashboard/interview-prep", desc: "Research" },
                { label: "View Profile", icon: BarChart3, href: "/dashboard/resume-analysis/result", desc: "Insights" },
              ].map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={action.label} href={action.href}>
                    <motion.button
                      data-cursor-hover
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full p-6 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 flex flex-col items-center gap-3 group"
                    >
                      <div className="p-3 rounded-lg border border-border/50 bg-muted/30 group-hover:border-accent/50 transition-colors">
                        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
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

