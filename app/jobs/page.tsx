"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Loader2, Filter, RefreshCw } from "lucide-react"
import { SentientSphere } from "@/components/sentient-sphere"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import { JobCard } from "@/components/job-card"
import { JobMatch } from "@/lib/job-matching-service"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function JobsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [jobs, setJobs] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [searchKeywords, setSearchKeywords] = useState("")
  const [location, setLocation] = useState("")
  const [filterScore, setFilterScore] = useState(0)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const userObj = JSON.parse(userData)
    setUser(userObj)
  }, [router])

  const discoverJobs = async (email: string, keywords?: string[], loc?: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/jobs/discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          keywords: keywords || (searchKeywords ? searchKeywords.split(",").map(k => k.trim()) : undefined),
          location: loc || location || undefined,
          maxResults: 30,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to discover jobs")
      }

      const data = await response.json()
      setJobs(data.jobs || [])
      toast.success(`Found ${data.jobs?.length || 0} job matches!`)
    } catch (error) {
      console.error("Error discovering jobs:", error)
      toast.error(error instanceof Error ? error.message : "Failed to discover jobs")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!user) return
    const keywords = searchKeywords
      ? searchKeywords.split(",").map(k => k.trim()).filter(k => k)
      : undefined
    discoverJobs(user.email, keywords, location)
  }

  const filteredJobs = jobs.filter(job => job.matchScore >= filterScore)

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
              <button
                onClick={() => router.push("/dashboard")}
                className="font-mono text-xs tracking-widest text-foreground font-semibold hover:text-purple-400 transition-colors"
              >
                ← DASHBOARD
              </button>
              <div>
                <h1 className="font-sans text-xl font-light">Job Discovery</h1>
                <p className="font-mono text-xs text-muted-foreground">
                  {filteredJobs.length} jobs found
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="relative z-10 px-6 py-8 md:px-12 md:py-10">
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <div className="p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm">
              <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
                SEARCH JOBS
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="font-mono text-xs text-muted-foreground mb-2 block">
                    Keywords (comma-separated)
                  </label>
                  <Input
                    type="text"
                    placeholder="React, Node.js, TypeScript"
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                    className="bg-background/50 border-white/10"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-muted-foreground mb-2 block">
                    Location
                  </label>
                  <Input
                    type="text"
                    placeholder="Remote, New York, etc."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-background/50 border-white/10"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-muted-foreground mb-2 block">
                    Min Match Score
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={filterScore}
                    onChange={(e) => setFilterScore(Number(e.target.value))}
                    className="bg-background/50 border-white/10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex items-center gap-2"
                  data-cursor-hover
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Search Jobs</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    if (user) {
                      discoverJobs(user.email)
                    }
                  }}
                  disabled={loading}
                  variant="outline"
                  className="flex items-center gap-2"
                  data-cursor-hover
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Jobs List */}
          {loading && jobs.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
                <p className="font-mono text-sm text-muted-foreground">
                  Discovering jobs...
                </p>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-mono text-sm text-muted-foreground mb-4">
                No jobs found. Try adjusting your search criteria.
              </p>
              <Button
                onClick={() => {
                  if (user) {
                    discoverJobs(user.email)
                  }
                }}
                variant="outline"
                data-cursor-hover
              >
                Discover Jobs from Profile
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredJobs.map((match, index) => (
                <JobCard key={`${match.job.title}-${match.job.company}-${index}`} match={match} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SmoothScroll>
  )
}

