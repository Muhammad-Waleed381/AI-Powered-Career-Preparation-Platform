"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Upload, FileText, X, Check, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { SentientSphere } from "@/components/sentient-sphere"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import { toast } from "sonner"
import Link from "next/link"

export default function ResumeAnalysisPage() {
    const router = useRouter()
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string>("")
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [isUploading, setIsUploading] = useState(false)
    const [user, setUser] = useState<{ name: string; email: string } | null>(null)
    const [hasSavedProfile, setHasSavedProfile] = useState(false)

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (!userData) {
            router.push("/login")
            return
        }
        const userObj = JSON.parse(userData)
        setUser(userObj)

        // Check if user has a saved profile
        const savedProfile = localStorage.getItem(`profile_${userObj.email}`)
        const resumeProfile = localStorage.getItem("resumeProfile")
        
        if (savedProfile || resumeProfile) {
            setHasSavedProfile(true)
        }
    }, [router])

    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const validateFile = (file: File): string | null => {
        if (file.type !== "application/pdf") {
            return "Please upload a PDF file"
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
        }
        return null
    }

    const processFile = (file: File) => {
        const validationError = validateFile(file)
        if (validationError) {
            setError(validationError)
            return
        }

        setError("")
        setUploadedFile(file)

        // Create preview URL for PDF
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files.length > 0) {
            processFile(files[0])
        }
    }, [])

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            processFile(files[0])
        }
    }

    const handleDelete = () => {
        setUploadedFile(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }
        setPreviewUrl("")
        setError("")
    }

    const handleAnalyze = async () => {
        if (!uploadedFile || !user) return

        setIsUploading(true)
        setError("")

        try {
            const formData = new FormData()
            formData.append("resume", uploadedFile)

            const response = await fetch("/api/cv/upload", {
                method: "POST",
                body: formData,
            })

            // Check if response is actually JSON
            const contentType = response.headers.get("content-type")
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text()
                console.error("Non-JSON response:", text.substring(0, 200))
                throw new Error(`Server returned ${response.status}: ${response.statusText}. Please check the console for details.`)
            }

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || errorData.message || "Failed to upload resume")
            }

            const data = await response.json()

            // Store profile data in localStorage for result page (display format)
            localStorage.setItem("resumeProfile", JSON.stringify(data.profile))
            localStorage.setItem("resumeProfileId", data.profileId)

            // Also save in the format expected by job discovery (database format)
            const email = data.profile.personalInfo?.email || userObj.email
            const dbFormatProfile = {
                id: data.profileId,
                email: email,
                full_name: data.profile.personalInfo?.name || email.split('@')[0],
                phone: data.profile.personalInfo?.phone || '',
                location: data.profile.personalInfo?.location || '',
                linkedin_url: data.profile.personalInfo?.linkedin || undefined,
                github_url: data.profile.personalInfo?.github || undefined,
                portfolio_url: data.profile.personalInfo?.portfolio || undefined,
                summary: data.profile.summary || '',
                skills: data.profile.skills || { technical: [], languages: [], frameworks: [], tools: [], soft: [] },
                experience: data.profile.experience || [],
                education: data.profile.education || [],
                certifications: data.profile.certifications || [],
                projects: data.profile.projects || [],
                skill_proficiency: data.profile.analysis?.skillProficiency || [],
                top_strengths: data.profile.analysis?.topStrengths || [],
                experience_level: data.profile.analysis?.experienceLevel || 'mid',
                total_years_experience: data.profile.analysis?.totalYearsExperience || 0,
                file_name: 'resume.pdf',
                file_size: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(`profile_${email}`, JSON.stringify(dbFormatProfile))

            toast.success("Resume analyzed successfully!")
            
            // Navigate to results page
            router.push("/dashboard/resume-analysis/result")
        } catch (error) {
            console.error("Upload error:", error)
            const errorMessage = error instanceof Error ? error.message : "Failed to analyze resume"
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsUploading(false)
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B"
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
        return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    }

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
                            <Link
                                href="/dashboard"
                                className="font-mono text-xs tracking-widest text-foreground font-semibold hover:text-accent transition-colors"
                            >
                                ← DASHBOARD
                            </Link>
                            <div>
                                <h1 className="font-sans text-xl font-light">Resume Analysis</h1>
                                <p className="font-mono text-xs text-muted-foreground">
                                    Upload and analyze your resume
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Main Content */}
                <div className="relative z-10 px-6 py-8 md:px-12 md:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Saved Profile Banner */}
                        {hasSavedProfile && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-green-400" />
                                    <div>
                                        <p className="font-mono text-sm text-foreground">Saved profile found</p>
                                        <p className="font-mono text-xs text-muted-foreground">You can view your saved profile or upload a new resume</p>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard/resume-analysis/result"
                                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors font-mono text-xs"
                                >
                                    View Profile
                                </Link>
                            </motion.div>
                        )}
                        
                        {/* Upload Section */}
                        <div className="p-6 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm mb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-1">
                                        UPLOAD RESUME
                                    </p>
                                    <h2 className="font-sans text-xl font-light">PDF Upload & Parsing</h2>
                                </div>
                            </div>

                            {!uploadedFile ? (
                                <div>
                                    {/* Drag and Drop Zone */}
                                    <label
                                        htmlFor="file-upload"
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`relative block w-full cursor-pointer transition-all duration-300 border-2 border-dashed rounded-xl p-12 ${
                                            isDragging
                                                ? "border-purple-500 bg-purple-500/10 scale-[1.02]"
                                                : "border-border hover:border-accent/50 hover:bg-muted/30"
                                        }`}
                                    >
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            onChange={handleFileInput}
                                            className="hidden"
                                        />

                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <motion.div
                                                animate={{
                                                    y: isDragging ? -10 : 0,
                                                    scale: isDragging ? 1.1 : 1,
                                                }}
                                                transition={{ duration: 0.2 }}
                                                className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center"
                                            >
                                                <Upload className="w-8 h-8 text-accent" />
                                            </motion.div>

                                            <div className="text-center">
                                                <p className="text-lg font-medium mb-1">
                                                    {isDragging ? "Drop your resume here" : "Upload Resume (PDF)"}
                                                </p>
                                                <p className="text-sm text-muted-foreground font-mono">
                                                    Drag and drop or click to browse
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                                                <div className="flex items-center gap-1">
                                                    <Check className="w-3 h-3 text-green-500" />
                                                    <span>PDF format</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Check className="w-3 h-3 text-green-500" />
                                                    <span>Max 10MB</span>
                                                </div>
                                            </div>
                                        </div>
                                    </label>

                                    {/* Error Message */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
                                            >
                                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                <p className="text-sm text-red-400 font-mono">{error}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    {/* File Preview Card */}
                                    <div className="bg-card/50 border border-border/50 rounded-xl p-6">
                                        <div className="flex items-start gap-4">
                                            {/* PDF Thumbnail Preview */}
                                            <div className="flex-shrink-0 w-24 h-32 bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
                                                {previewUrl ? (
                                                    <iframe
                                                        src={`${previewUrl}#page=1&view=FitH`}
                                                        className="w-full h-full pointer-events-none"
                                                        title="PDF Preview"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <FileText className="w-12 h-12 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* File Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium truncate mb-1">
                                                            {uploadedFile.name}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground font-mono">
                                                            {formatFileSize(uploadedFile.size)}
                                                        </p>
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                            <span className="text-xs text-green-400 font-mono">
                                                                Ready for analysis
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex items-center gap-2">
                                                        <label
                                                            htmlFor="file-replace"
                                                            className="px-4 py-2 text-xs font-mono bg-muted/20 hover:bg-muted/40 border border-border/50 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Replace
                                                            <input
                                                                id="file-replace"
                                                                type="file"
                                                                accept=".pdf,application/pdf"
                                                                onChange={handleFileInput}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                        <button
                                                            onClick={handleDelete}
                                                            className="p-2 text-destructive hover:bg-destructive/10 border border-border/50 rounded-lg transition-colors"
                                                            aria-label="Delete file"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Analyze Button */}
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
                                        <p className="text-sm font-mono text-muted-foreground">
                                            Ready to analyze your resume
                                        </p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleAnalyze}
                                            disabled={isUploading}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-mono text-sm font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                            data-cursor-hover
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Analyzing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Analyze Resume</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </SmoothScroll>
    )
}
