"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
    Upload,
    Download,
    RefreshCw,
    Edit3,
    Save,
    FileText,
    Briefcase,
    GraduationCap,
    Award,
    Target,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Clock,
    ArrowLeft,
} from "lucide-react"
import { SentientSphere } from "@/components/sentient-sphere"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import Link from "next/link"
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"

interface ProfileData {
    id?: string
    personalInfo: {
        name: string
        email: string
        phone: string
        location: string
        linkedin?: string
        github?: string
        portfolio?: string
    }
    summary: string
    skills: {
        technical: string[]
        languages: string[]
        frameworks: string[]
        tools: string[]
        soft: string[]
    }
    experience: Array<{
        title: string
        company: string
        location: string
        startDate: string
        endDate: string
        responsibilities: string[]
        achievements: string[]
        technologies: string[]
    }>
    education: Array<{
        degree: string
        field: string
        institution: string
        location: string
        graduationDate: string
        gpa?: string
        achievements: string[]
    }>
    certifications: Array<{
        name: string
        issuer: string
        date: string
        url?: string
    }>
    projects: Array<{
        name: string
        description: string
        technologies: string[]
        url?: string
    }>
    analysis: {
        skillProficiency: Array<{
            skill: string
            level: string
            yearsOfExperience: number
            context: string
        }>
        topStrengths: string[]
        experienceLevel: string
        totalYearsExperience: number
    }
}

export default function ResumeResultPage() {
    const router = useRouter()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [isSaved, setIsSaved] = useState(false)
    const [user, setUser] = useState<{ name: string; email: string } | null>(null)

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (!userData) {
            router.push("/login")
            return
        }
        setUser(JSON.parse(userData))

        // Load profile from localStorage
        const profileData = localStorage.getItem("resumeProfile")
        if (profileData) {
            try {
                setProfile(JSON.parse(profileData))
            } catch (error) {
                console.error("Error parsing profile:", error)
                toast.error("Failed to load profile data")
            }
        } else {
            toast.error("No profile data found. Please upload a resume first.")
            router.push("/dashboard/resume-analysis")
        }
    }, [router])

    const handleSave = () => {
        setIsSaved(true)
        toast.success("Profile saved successfully!")
        setTimeout(() => setIsSaved(false), 2000)
    }

    const calculateATSScore = (): number => {
        if (!profile) return 0
        let score = 0
        const maxScore = 100

        // Skills presence (30 points) - with null checks
        const technical = profile.skills?.technical || []
        const frameworks = profile.skills?.frameworks || []
        const tools = profile.skills?.tools || []
        
        if (Array.isArray(technical) && technical.length > 0) score += 10
        if (Array.isArray(frameworks) && frameworks.length > 0) score += 10
        if (Array.isArray(tools) && tools.length > 0) score += 10

        // Experience (30 points) - with null check
        const experience = profile.experience || []
        if (Array.isArray(experience) && experience.length > 0) score += 15
        if (Array.isArray(experience) && experience.length > 1) score += 15

        // Education (20 points) - with null check
        const education = profile.education || []
        if (Array.isArray(education) && education.length > 0) score += 20

        // Summary (10 points) - with null check
        const summary = profile.summary || ''
        if (summary && summary.length > 50) score += 10

        // Contact info (10 points) - with null check
        const personalInfo = profile.personalInfo || {}
        if (personalInfo.email) score += 5
        if (personalInfo.phone) score += 5

        return Math.min(score, maxScore)
    }

    const getSkillsRadarData = () => {
        if (!profile || !profile.skills) return []
        
        const categories = ["Technical", "Frameworks", "Tools", "Languages", "Soft Skills"]
        const technical = profile.skills.technical || []
        const frameworks = profile.skills.frameworks || []
        const tools = profile.skills.tools || []
        const languages = profile.skills.languages || []
        const soft = profile.skills.soft || []
        
        const values = [
            (Array.isArray(technical) ? technical.length : 0) * 10,
            (Array.isArray(frameworks) ? frameworks.length : 0) * 10,
            (Array.isArray(tools) ? tools.length : 0) * 10,
            (Array.isArray(languages) ? languages.length : 0) * 10,
            (Array.isArray(soft) ? soft.length : 0) * 10,
        ].map(v => Math.min(v, 100))

        return categories.map((category, idx) => ({
            category,
            value: values[idx],
        }))
    }

    if (!user || !profile) {
        return null
    }

    const atsScore = calculateATSScore()
    const skillsData = getSkillsRadarData()
    const topSkills = (profile.analysis?.skillProficiency || []).slice(0, 5)

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
                            <Link
                                href="/dashboard/resume-analysis"
                                className="font-mono text-xs tracking-widest text-foreground font-semibold hover:text-purple-400 transition-colors"
                            >
                                ← UPLOAD
                            </Link>
                            <div>
                                <h1 className="font-sans text-xl font-light">Resume Analysis Results</h1>
                                <p className="font-mono text-xs text-muted-foreground">
                                    AI-powered insights and structured resume data
                                </p>
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: isSaved ? 1 : 0.7, scale: 1 }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                        >
                            <Clock className="w-4 h-4 text-green-400" />
                            <span className="text-xs font-mono text-muted-foreground">
                                {isSaved ? "Saved" : "Autosaved"}
                            </span>
                        </motion.div>
                    </div>
                </motion.header>

                {/* Main Content */}
                <div className="relative z-10 px-6 py-8 md:px-12 md:py-12">
                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-wrap gap-3 mb-8"
                    >
                        <Link href="/dashboard/resume-analysis">
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors font-mono text-xs"
                                data-cursor-hover
                            >
                                <Upload className="w-4 h-4" />
                                Upload New Resume
                            </button>
                        </Link>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-lg transition-colors font-mono text-xs"
                            data-cursor-hover
                        >
                            <Save className="w-4 h-4" />
                            Save Profile
                        </button>
                    </motion.div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Structured Resume Output */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Skills Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground mb-1">
                                            SKILLS
                                        </p>
                                        <h2 className="font-sans text-xl font-light">Technical & Soft Skills</h2>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: "Technical", skills: profile.skills?.technical || [] },
                                        { label: "Frameworks", skills: profile.skills?.frameworks || [] },
                                        { label: "Tools", skills: profile.skills?.tools || [] },
                                        { label: "Soft Skills", skills: profile.skills?.soft || [] },
                                    ].map((category) => (
                                        Array.isArray(category.skills) && category.skills.length > 0 && (
                                            <div key={category.label}>
                                                <h3 className="text-sm font-mono text-muted-foreground mb-2">
                                                    {category.label}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {category.skills.map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full text-xs font-mono hover:scale-105 transition-transform cursor-pointer"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </motion.div>

                            {/* Experience Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                        <Briefcase className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground mb-1">
                                            EXPERIENCE
                                        </p>
                                        <h2 className="font-sans text-xl font-light">Work History</h2>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {(profile.experience || []).map((exp, idx) => (
                                        <div key={idx} className="relative pl-8 border-l-2 border-purple-500/30">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-500 border-4 border-[#050505]" />
                                            <div className="bg-background/50 border border-white/10 rounded-xl p-4 hover:bg-background/70 transition-colors">
                                                <div className="mb-2">
                                                    <h3 className="font-semibold text-lg">{exp.title}</h3>
                                                    <p className="text-sm text-purple-400 font-mono">{exp.company}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-mono mb-3">
                                                    {exp.startDate} - {exp.endDate} · {exp.location}
                                                </p>
                                                {exp.responsibilities.length > 0 && (
                                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                                        {exp.responsibilities.slice(0, 3).map((resp, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                                <span>{resp}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Education Section */}
                            {profile.education && Array.isArray(profile.education) && profile.education.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                            <GraduationCap className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground mb-1">
                                                EDUCATION
                                            </p>
                                            <h2 className="font-sans text-xl font-light">Academic Background</h2>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {(profile.education || []).map((edu, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-background/50 border border-white/10 rounded-xl p-4 hover:bg-background/70 transition-colors"
                                            >
                                                <h3 className="font-semibold">{edu.degree}</h3>
                                                <p className="text-sm text-purple-400 font-mono mt-1">
                                                    {edu.institution}
                                                </p>
                                                <p className="text-xs text-muted-foreground font-mono mt-2">
                                                    {edu.graduationDate} {edu.gpa && `· GPA: ${edu.gpa}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Certifications Section */}
                            {profile.certifications && Array.isArray(profile.certifications) && profile.certifications.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    className="p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                            <Award className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground mb-1">
                                                CERTIFICATIONS
                                            </p>
                                            <h2 className="font-sans text-xl font-light">Achievements</h2>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {(profile.certifications || []).map((cert, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg hover:scale-105 transition-transform"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                                    <Award className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium">{cert.name}</span>
                                                    <p className="text-xs text-muted-foreground font-mono">{cert.issuer}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Right Column - AI Insights Panel */}
                        <div className="space-y-6">
                            {/* ATS Score */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Target className="w-6 h-6 text-purple-400" />
                                    <h3 className="text-lg font-semibold">ATS Readiness</h3>
                                </div>
                                <div className="flex items-center justify-center mb-4">
                                    <div className="relative w-32 h-32">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                className="text-white/10"
                                            />
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="url(#gradient)"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 56}`}
                                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - atsScore / 100)}`}
                                                className="transition-all duration-1000"
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#a855f7" />
                                                    <stop offset="100%" stopColor="#3b82f6" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-3xl font-bold">{atsScore}%</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-center text-muted-foreground font-mono">
                                    {atsScore >= 80
                                        ? "Your resume is well-optimized for ATS systems"
                                        : atsScore >= 60
                                        ? "Your resume needs some improvements"
                                        : "Consider adding more details to improve ATS score"}
                                </p>
                            </motion.div>

                            {/* Skill Radar Chart */}
                            {skillsData.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <TrendingUp className="w-6 h-6 text-blue-400" />
                                        <h3 className="text-lg font-semibold">Skill Distribution</h3>
                                    </div>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <RadarChart data={skillsData}>
                                            <PolarGrid stroke="#ffffff20" />
                                            <PolarAngleAxis
                                                dataKey="category"
                                                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                            />
                                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#a1a1aa" }} />
                                            <Radar
                                                name="Skills"
                                                dataKey="value"
                                                stroke="#a855f7"
                                                fill="#a855f7"
                                                fillOpacity={0.5}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}

                            {/* Proficiency Levels */}
                            {topSkills.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <Sparkles className="w-6 h-6 text-purple-400" />
                                        <h3 className="text-lg font-semibold">Top Skills</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {topSkills.map((item) => {
                                            const levelMap: { [key: string]: number } = {
                                                beginner: 30,
                                                intermediate: 60,
                                                advanced: 85,
                                                expert: 100,
                                            }
                                            const level = levelMap[item.level] || 50
                                            return (
                                                <div key={item.skill}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-mono">{item.skill}</span>
                                                        <span className="text-xs text-muted-foreground capitalize">
                                                            {item.level}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${level}%` }}
                                                            transition={{ duration: 1, delay: 0.5 }}
                                                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* AI Insights */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="p-6 border border-white/10 rounded-lg bg-background/30 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Sparkles className="w-6 h-6 text-blue-400" />
                                    <h3 className="text-lg font-semibold">AI Insights</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-green-400">
                                                    Experience Level: {profile.analysis?.experienceLevel || 'N/A'}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1 font-mono">
                                                    {profile.analysis?.totalYearsExperience || 0} years of experience
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {profile.analysis?.topStrengths && Array.isArray(profile.analysis.topStrengths) && profile.analysis.topStrengths.length > 0 && (
                                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-400">Top Strengths</p>
                                                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                                                        {(profile.analysis?.topStrengths || []).slice(0, 3).join(", ")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </SmoothScroll>
    )
}
