"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Code, Users, ChevronDown, Lightbulb } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

interface Question {
    question: string
    difficulty: string
    topics: string[]
    hints: string[]
    sampleAnswer: string
    category?: string
    framework?: string
}

interface QuestionsBankProps {
    data: {
        technical: Question[]
        behavioral: Question[]
    }
}

export function QuestionsBank({ data }: QuestionsBankProps) {
    const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({})

    const toggleHints = (questionId: string) => {
        setRevealedHints((prev) => ({
            ...prev,
            [questionId]: !prev[questionId],
        }))
    }

    const getDifficultyColor = (difficulty: string) => {
        const lower = difficulty?.toLowerCase() || ""
        if (lower.includes("easy")) return "bg-green-500/20 text-green-400 border-green-500/30"
        if (lower.includes("medium") || lower.includes("mid")) return "bg-blue-500/20 text-blue-400 border-blue-500/30"
        if (lower.includes("hard") || lower.includes("senior")) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }

    const renderQuestions = (questions: Question[], type: "technical" | "behavioral") => {
        const Icon = type === "technical" ? Code : Users

        if (!questions || questions.length === 0) {
            return <div className="text-center p-4 text-muted-foreground">No questions available.</div>
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-5 h-5 text-accent" />
                    <h4 className="font-mono text-sm tracking-wider">
                        {questions.length} Questions Generated
                    </h4>
                </div>

                <Accordion type="multiple" className="space-y-3">
                    {questions.map((q, index) => {
                        const questionId = `${type}-${index}`
                        const category = type === "behavioral" ? q.category : (q.topics?.[0] || "General")

                        return (
                            <AccordionItem
                                key={questionId}
                                value={questionId}
                                className="border border-border/50 rounded-lg bg-card/30 px-5"
                            >
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-start gap-3 text-left flex-1">
                                        <span className="font-mono text-xs text-muted-foreground mt-1">
                                            #{index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-sans text-sm font-light mb-2">{q.question}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge className={getDifficultyColor(q.difficulty)}>
                                                    {q.difficulty}
                                                </Badge>
                                                <Badge variant="outline" className="font-mono text-[10px]">
                                                    {category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <div className="ml-9 pt-2 space-y-4">
                                        {/* Hints */}
                                        {q.hints && q.hints.length > 0 && (
                                            <>
                                                <button
                                                    onClick={() => toggleHints(questionId)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                                                >
                                                    <Lightbulb className="w-4 h-4 text-accent" />
                                                    <span className="font-mono text-xs text-accent">
                                                        {revealedHints[questionId] ? "Hide" : "Reveal"} Hints
                                                    </span>
                                                    <ChevronDown
                                                        className={`w-4 h-4 text-accent transition-transform ${revealedHints[questionId] ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </button>

                                                <AnimatePresence>
                                                    {revealedHints[questionId] && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="space-y-2"
                                                        >
                                                            {q.hints.map((hint, idx) => (
                                                                <motion.div
                                                                    key={idx}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: idx * 0.1 }}
                                                                    className="flex items-start gap-2 p-3 rounded-lg bg-card/50 border border-border/30"
                                                                >
                                                                    <span className="text-accent font-mono text-xs mt-0.5">
                                                                        💡
                                                                    </span>
                                                                    <span className="font-mono text-xs text-muted-foreground">
                                                                        {hint}
                                                                    </span>
                                                                </motion.div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </>
                                        )}

                                        {/* Sample Answer */}
                                        {q.sampleAnswer && (
                                            <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                                                <h6 className="font-mono text-xs tracking-wider text-green-400 mb-2">
                                                    Sample Answer
                                                </h6>
                                                <p className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                                                    {q.sampleAnswer}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </div>
        )
    }

    if (!data || (!data.technical && !data.behavioral)) {
        return <div className="text-center p-4 text-muted-foreground">No questions available.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">
                    INTERVIEW PREP
                </p>
                <h3 className="font-sans text-xl font-light">Questions Bank</h3>
                <p className="font-mono text-xs text-muted-foreground mt-2">
                    AI-generated questions based on company culture and role requirements
                </p>
            </div>

            <Tabs defaultValue="technical" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-background/30">
                    <TabsTrigger value="technical" className="font-mono text-xs">
                        Technical ({data.technical?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="behavioral" className="font-mono text-xs">
                        Behavioral ({data.behavioral?.length || 0})
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="technical" className="mt-6">
                    {renderQuestions(data.technical || [], "technical")}
                </TabsContent>
                <TabsContent value="behavioral" className="mt-6">
                    {renderQuestions(data.behavioral || [], "behavioral")}
                </TabsContent>
            </Tabs>
        </div>
    )
}
