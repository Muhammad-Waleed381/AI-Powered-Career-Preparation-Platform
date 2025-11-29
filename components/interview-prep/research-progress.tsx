"use client"

import { motion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"

interface ResearchProgressProps {
    currentStep: number
    steps: string[]
    logs: string[]
}

const stepIcons = {
    pending: null,
    active: Loader2,
    complete: Check,
}

export function ResearchProgress({ currentStep, steps, logs }: ResearchProgressProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm"
        >
            <div className="mb-6">
                <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">
                    DEEP DIVE IN PROGRESS
                </p>
                <h2 className="font-sans text-2xl font-light">Analyzing Research Data</h2>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4 mb-8">
                {steps.map((step, index) => {
                    const status =
                        index < currentStep ? "complete" : index === currentStep ? "active" : "pending"
                    const Icon = stepIcons[status as keyof typeof stepIcons]

                    return (
                        <div key={index} className="flex items-center gap-4">
                            <div
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${status === "complete"
                                        ? "border-green-500 bg-green-500/20"
                                        : status === "active"
                                            ? "border-accent bg-accent/20"
                                            : "border-border/50 bg-card/30"
                                    }`}
                            >
                                {Icon &&
                                    (status === "active" ? (
                                        <Loader2 className="w-4 h-4 text-accent animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4 text-green-400" />
                                    ))}
                            </div>

                            <div className="flex-1">
                                <p
                                    className={`font-mono text-sm transition-colors ${status === "complete"
                                            ? "text-green-400"
                                            : status === "active"
                                                ? "text-accent"
                                                : "text-muted-foreground"
                                        }`}
                                >
                                    {step}
                                </p>
                            </div>

                            {status === "active" && (
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100px" }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Terminal-style Logs */}
            <div className="border border-border/50 rounded-lg bg-muted/20 p-4 max-h-64 overflow-y-auto">
                <p className="font-mono text-xs text-green-400 mb-2">$ ai-research --verbose</p>
                <div className="space-y-1">
                    {logs.map((log, index) => (
                        <motion.p
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="font-mono text-xs text-muted-foreground"
                        >
                            <span className="text-accent">[{new Date().toLocaleTimeString()}]</span> {log}
                        </motion.p>
                    ))}
                    <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-2 h-4 bg-purple-400 ml-1"
                    />
                </div>
            </div>
        </motion.div>
    )
}
