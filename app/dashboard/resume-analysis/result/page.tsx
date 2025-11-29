"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts"

// Mock data for demonstration
const mockSkillsData = [
    { category: "Frontend", value: 85 },
    { category: "Backend", value: 70 },
    { category: "DevOps", value: 60 },
    { category: "Database", value: 75 },
    { category: "Cloud", value: 65 },
    { category: "Mobile", value: 50 },
]

const mockProficiencyData = [
    { skill: "React", level: 90 },
    { skill: "TypeScript", level: 85 },
    { skill: "Node.js", level: 75 },
    { skill: "Python", level: 70 },
    { skill: "AWS", level: 65 },
]

export default function ResumeResultPage() {
    const pathname = usePathname()
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [isSaved, setIsSaved] = useState(false)

    const handleSave = () => {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 2000)
    }

    return (
        <div className="min-h-screen bg-[#050505] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Resume Analysis Results
                        </h1>
                        {/* Save Indicator */}
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
                    <p className="text-muted-foreground font-mono text-sm">
                        AI-powered insights and structured resume data
                    </p>
                </motion.div>

                {/* Navigation Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="inline-flex bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-1">
                        <Link href="/dashboard/resume-analysis">
                            <button
                                className={cn(
                                    "px-6 py-2.5 rounded-md font-mono text-xs tracking-wider transition-all duration-300",
                                    pathname === "/dashboard/resume-analysis"
                                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                Resume Analysis
                            </button>
                        </Link>
                        <Link href="/dashboard/resume-analysis/result">
                            <button
                                className={cn(
                                    "px-6 py-2.5 rounded-md font-mono text-xs tracking-wider transition-all duration-300",
                                    pathname === "/dashboard/resume-analysis/result"
                                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                Result
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-wrap gap-3 mb-8"
                >
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors font-mono text-xs">
                        <Upload className="w-4 h-4" />
                        Upload New Resume
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors font-mono text-xs">
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors font-mono text-xs">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-lg transition-colors font-mono text-xs">
                        <RefreshCw className="w-4 h-4" />
                        AI Regenerate Insights
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
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Skills</h2>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        Categorized technical and soft skills
                                    </p>
                                </div>
                            </div>

                            {/* Skills by Category */}
                            <div className="space-y-4">
                                {["Languages", "Frameworks", "Tools", "Soft Skills"].map((category, idx) => (
                                    <div key={category}>
                                        <h3 className="text-sm font-mono text-muted-foreground mb-2">
                                            {category}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                "JavaScript",
                                                "TypeScript",
                                                "Python",
                                                "React",
                                                "Node.js",
                                            ].map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full text-xs font-mono hover:scale-105 transition-transform cursor-pointer"
                                                >
                                                    {skill}
                                                    <span className="ml-2 text-green-400">95%</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Experience Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Experience</h2>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        Professional work history
                                    </p>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-6">
                                {[1, 2].map((item) => (
                                    <div key={item} className="relative pl-8 border-l-2 border-purple-500/30">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-500 border-4 border-[#050505]" />
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg">Senior Software Engineer</h3>
                                                    <p className="text-sm text-purple-400 font-mono">Tech Corp Inc.</p>
                                                </div>
                                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                                                    <Edit3 className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-mono mb-3">
                                                Jan 2022 - Present · 2 years
                                            </p>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>Led development of microservices architecture serving 1M+ users</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>Improved system performance by 40% through optimization</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Education Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Education</h2>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        Academic background
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[1, 2].map((item) => (
                                    <div
                                        key={item}
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold">Bachelor of Science in Computer Science</h3>
                                                <p className="text-sm text-purple-400 font-mono mt-1">
                                                    University of Technology
                                                </p>
                                                <p className="text-xs text-muted-foreground font-mono mt-2">
                                                    2018 - 2022 · GPA: 3.8/4.0
                                                </p>
                                            </div>
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                                                <Edit3 className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Achievements Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <Award className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Achievements</h2>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        Notable accomplishments
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {["AWS Certified", "Hackathon Winner", "Open Source Contributor", "Tech Speaker"].map(
                                    (achievement) => (
                                        <div
                                            key={achievement}
                                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg hover:scale-105 transition-transform"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                                <Award className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-sm font-medium">{achievement}</span>
                                        </div>
                                    )
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - AI Insights Panel */}
                    <div className="space-y-6">
                        {/* ATS Score */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6"
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
                                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.85)}`}
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
                                        <span className="text-3xl font-bold">85%</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-center text-muted-foreground">
                                Your resume is well-optimized for ATS systems
                            </p>
                        </motion.div>

                        {/* Skill Radar Chart */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <TrendingUp className="w-6 h-6 text-blue-400" />
                                <h3 className="text-lg font-semibold">Skill Distribution</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <RadarChart data={mockSkillsData}>
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

                        {/* Proficiency Levels */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                                <h3 className="text-lg font-semibold">Top Skills</h3>
                            </div>
                            <div className="space-y-4">
                                {mockProficiencyData.map((item) => (
                                    <div key={item.skill}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-mono">{item.skill}</span>
                                            <span className="text-xs text-muted-foreground">{item.level}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.level}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* AI Insights */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
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
                                            <p className="text-sm font-medium text-green-400">Strong Technical Profile</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Your skills align well with senior engineering roles
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-400">Add Cloud Certifications</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Consider adding AWS or Azure certifications
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-400">Recommended Roles</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Full Stack Engineer, Tech Lead, Solutions Architect
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="flex items-center justify-between mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl"
                >
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors font-mono text-sm">
                        <FileText className="w-4 h-4" />
                        Preview Resume Rebuild
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/50 rounded-lg transition-shadow font-mono text-sm font-medium"
                    >
                        <Save className="w-4 h-4" />
                        Save & Continue
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
