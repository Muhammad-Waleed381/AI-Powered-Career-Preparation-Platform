"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Loader2, Filter, RefreshCw } from "lucide-react"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import { JobCard } from "@/components/job-card"
import { JobMatch } from "@/lib/job-matching-service"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function JobPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [jobs, setJobs] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [searchKeywords, setSearchKeywords] = useState("")
  const [location, setLocation] = useState("")
  const [filterScore, setFilterScore] = useState(0)
  const [hasProfile, setHasProfile] = useState(false)

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
      // Try to get profile from localStorage - check both sources
      let profileData = null
      
      // First, try resumeProfile (display format)
      const resumeProfile = localStorage.getItem("resumeProfile")
      if (resumeProfile) {
        try {
          const profile = JSON.parse(resumeProfile)
          // Convert to the format expected by the API
          profileData = {
            email: profile.personalInfo?.email || email,
            full_name: profile.personalInfo?.name || email.split('@')[0],
            phone: profile.personalInfo?.phone || '',
            location: profile.personalInfo?.location || '',
            linkedin_url: profile.personalInfo?.linkedin || undefined,
            github_url: profile.personalInfo?.github || undefined,
            portfolio_url: profile.personalInfo?.portfolio || undefined,
            summary: profile.summary || '',
            skills: profile.skills || { technical: [], languages: [], frameworks: [], tools: [], soft: [] },
            experience: profile.experience || [],
            education: profile.education || [],
            certifications: profile.certifications || [],
            projects: profile.projects || [],
            skill_proficiency: profile.analysis?.skillProficiency || [],
            top_strengths: profile.analysis?.topStrengths || [],
            experience_level: profile.analysis?.experienceLevel || 'mid',
            total_years_experience: profile.analysis?.totalYearsExperience || 0,
            file_name: 'resume.pdf',
            file_size: 0,
          }
          console.log("✅ Found profile in resumeProfile")
        } catch (e) {
          console.error("Error parsing resumeProfile:", e)
        }
      }
      
      // If not found, try saved profile format (profile_${email})
      if (!profileData) {
        const savedProfile = localStorage.getItem(`profile_${email}`)
        if (savedProfile) {
          try {
            const saved = JSON.parse(savedProfile)
            profileData = {
              email: saved.email || email,
              full_name: saved.full_name || email.split('@')[0],
              phone: saved.phone || '',
              location: saved.location || '',
              linkedin_url: saved.linkedin_url || undefined,
              github_url: saved.github_url || undefined,
              portfolio_url: saved.portfolio_url || undefined,
              summary: saved.summary || '',
              skills: saved.skills || { technical: [], languages: [], frameworks: [], tools: [], soft: [] },
              experience: saved.experience || [],
              education: saved.education || [],
              certifications: saved.certifications || [],
              projects: saved.projects || [],
              skill_proficiency: saved.skill_proficiency || [],
              top_strengths: saved.top_strengths || [],
              experience_level: saved.experience_level || 'mid',
              total_years_experience: saved.total_years_experience || 0,
              file_name: saved.file_name || 'resume.pdf',
              file_size: saved.file_size || 0,
            }
            console.log("✅ Found profile in saved format")
          } catch (e) {
            console.error("Error parsing saved profile:", e)
          }
        }
      }
      
      if (profileData) {
        console.log("📋 Using profile data:", {
          email: profileData.email,
          skills: profileData.skills?.technical?.length || 0,
          experience: profileData.experience?.length || 0,
        })
        setHasProfile(true)
      } else {
        console.warn("⚠️ No profile found in localStorage")
        setHasProfile(false)
      }

      const requestBody = {
        email,
        profile: profileData, // Send profile data if available
        keywords: keywords || (searchKeywords ? searchKeywords.split(",").map(k => k.trim()).filter(k => k) : undefined),
        location: loc || location || undefined,
        maxResults: 30,
      }
      
      console.log("📤 Sending request to API:", {
        email,
        hasProfile: !!profileData,
        profileSkills: profileData?.skills?.technical?.length || 0,
        profileExperience: profileData?.experience?.length || 0,
        keywords: requestBody.keywords,
        location: requestBody.location,
      })

      const response = await fetch("/api/jobs/discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorData
        try {
          const text = await response.text()
          errorData = text ? JSON.parse(text) : {}
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        const errorMessage = errorData.error || errorData.details || errorData.message || `Failed to discover jobs (${response.status})`
        console.error("API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        })
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setJobs(data.jobs || [])
      
      // Save jobs to localStorage for dashboard
      if (data.jobs && data.jobs.length > 0) {
        localStorage.setItem(`jobs_${email}`, JSON.stringify(data.jobs))
        toast.success(`Found ${data.jobs.length} job matches!`)
      } else {
        toast.info("No jobs found. Try adjusting your search criteria or upload your resume.")
      }
    } catch (error) {
      console.error("Error discovering jobs:", error)
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      
      const errorMessage = error instanceof Error ? error.message : "Failed to discover jobs"
      toast.error(errorMessage)
      
      // Show more helpful error message
      if (errorMessage.includes("SERP_API_KEY") || errorMessage.includes("SerpAPI")) {
        toast.error("Job search service is not configured. Please contact support.")
      } else if (errorMessage.includes("profile not found") || errorMessage.includes("upload your resume")) {
        toast.error("Please upload and save your resume first to discover jobs based on your profile.")
      } else if (errorMessage.includes("Unable to generate search keywords")) {
        toast.error("Your profile doesn't have enough information. Please upload a resume with skills and experience.")
      }
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
            <div className="p-6 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
                  SEARCH JOBS
                </p>
                {hasProfile && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono text-[10px] text-green-400">Using CV Profile</span>
                  </div>
                )}
              </div>
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
                    className="bg-card/50 border-border/50"
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
                    className="bg-card/50 border-border/50"
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
                    className="bg-card/50 border-border/50"
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
                <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
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

