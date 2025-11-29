"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import { ResearchForm } from "@/components/interview-prep/research-form"
import { ResearchProgress } from "@/components/interview-prep/research-progress"
import { CompanyInsights } from "@/components/interview-prep/company-insights"
import { TechDeepDive } from "@/components/interview-prep/tech-deep-dive"
import { QuestionsBank } from "@/components/interview-prep/questions-bank"
import { StudyPlan } from "@/components/interview-prep/study-plan"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Share2, RotateCcw } from "lucide-react"

interface ResearchResult {
    companyInsights: any
    roleInsights: any
    techInsights: any[]
    preparationChecklist: any
    questions: {
        technical: any[]
        behavioral: any[]
    }
}

const RESEARCH_STEPS = [
    "Searching company information...",
    "Researching technology trends...",
    "Analyzing and filtering content...",
    "Synthesizing insights...",
    "Generating interview questions...",
]

export default function InterviewPrepPage() {
    const router = useRouter()
    const [user, setUser] = useState<{ name: string; email: string } | null>(null)
    const [isResearching, setIsResearching] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [logs, setLogs] = useState<string[]>([])
    const [results, setResults] = useState<ResearchResult | null>(null)
    const [sessionId, setSessionId] = useState<string | null>(null)

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem("user")
        if (!userData) {
            router.push("/login")
            return
        }
        setUser(JSON.parse(userData))
    }, [router])

    const handleStartResearch = async (data: {
        company: string
        role: string
        technologies: string[]
    }) => {
        setIsResearching(true)
        setCurrentStep(0)
        setLogs([])
        setResults(null)

        // Simulate progress
        const progressInterval = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev < RESEARCH_STEPS.length - 1) {
                    setLogs((logs) => [...logs, RESEARCH_STEPS[prev]])
                    return prev + 1
                }
                return prev
            })
        }, 2000)

        try {
            const response = await fetch("/api/interview-prep", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (response.ok) {
                clearInterval(progressInterval)
                setCurrentStep(RESEARCH_STEPS.length)
                setLogs((logs) => [...logs, "✅ Research complete!"])
                setResults(result.data)
                setSessionId(result.sessionId)
                
                // Save session to localStorage for dashboard
                if (user) {
                    const sessionData = {
                        company: data.company,
                        role: data.role,
                        technologies: data.technologies,
                        questions: result.data.questions,
                        created_at: new Date().toISOString(),
                        sessionId: result.sessionId
                    }
                    const existingSessions = localStorage.getItem(`interview_sessions_${user.email}`)
                    const sessions = existingSessions ? JSON.parse(existingSessions) : []
                    sessions.unshift(sessionData)
                    // Keep only last 10 sessions
                    localStorage.setItem(`interview_sessions_${user.email}`, JSON.stringify(sessions.slice(0, 10)))
                }
            } else {
                throw new Error(result.message || "Research failed")
            }
        } catch (error) {
            clearInterval(progressInterval)
            setLogs((logs) => [
                ...logs,
                `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            ])
            alert("Research failed. Please try again.")
        } finally {
            setIsResearching(false)
        }
    }

    const handleReset = () => {
        setResults(null)
        setSessionId(null)
        setCurrentStep(0)
        setLogs([])
    }

    const handleExportPDF = () => {
        // TODO: Implement PDF export
        alert("PDF export feature coming soon!")
    }

    const handleShare = () => {
        // TODO: Implement share functionality
        alert("Share feature coming soon!")
    }

    if (!user) {
        return null
    }

    return (
        <SmoothScroll>
            <CustomCursor />
            <div className="relative min-h-screen w-full overflow-hidden bg-background">

                {/* Main Content */}
                <div className="relative z-10 px-6 py-8 md:px-12 md:py-12 max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">
                            INTERVIEW PREPARATION
                        </p>
                        <h1 className="font-sans text-4xl md:text-5xl font-light tracking-tight mb-2">
                            Deep Research AI
                        </h1>
                        <p className="font-mono text-sm text-muted-foreground">
                            Get company insights, role analysis, and AI-generated interview questions
                        </p>
                    </motion.div>

                    {/* Input Form or Progress */}
                    {!results && !isResearching && (
                        <ResearchForm onSubmit={handleStartResearch} isLoading={isResearching} />
                    )}

                    {isResearching && (
                        <ResearchProgress currentStep={currentStep} steps={RESEARCH_STEPS} logs={logs} />
                    )}

                    {/* Results Dashboard */}
                    {results && !isResearching && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-4 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={handleExportPDF}
                                    className="font-mono text-xs"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleShare}
                                    className="font-mono text-xs"
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    className="font-mono text-xs"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    New Research
                                </Button>
                            </div>

                            {/* Results Tabs */}
                            <Tabs defaultValue="company" className="w-full">
                                <TabsList className="grid w-full grid-cols-4 bg-background/30 h-auto">
                                    <TabsTrigger value="company" className="font-mono text-xs py-3">
                                        Company
                                    </TabsTrigger>
                                    <TabsTrigger value="tech" className="font-mono text-xs py-3">
                                        Technology
                                    </TabsTrigger>
                                    <TabsTrigger value="questions" className="font-mono text-xs py-3">
                                        Questions
                                    </TabsTrigger>
                                    <TabsTrigger value="plan" className="font-mono text-xs py-3">
                                        Study Plan
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="company" className="mt-8">
                                    <CompanyInsights data={results.companyInsights} />
                                </TabsContent>

                                <TabsContent value="tech" className="mt-8">
                                    <TechDeepDive data={results.techInsights} />
                                </TabsContent>

                                <TabsContent value="questions" className="mt-8">
                                    <QuestionsBank data={results.questions} />
                                </TabsContent>

                                <TabsContent value="plan" className="mt-8">
                                    <StudyPlan data={results.preparationChecklist} />
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    )}
                </div>
            </div>
        </SmoothScroll>
    )
}
