"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Calendar, Book } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StudyPlanProps {
    data: {
        weeks: Array<{
            week: number
            focus: string
            tasks: Array<{
                task: string
                completed: boolean
            }>
            resources: string[]
        }>
        dailyPractice: string[]
        finalWeekTips: string[]
    }
}

export function StudyPlan({ data }: StudyPlanProps) {
    if (!data) {
        return <div className="text-center p-4 text-muted-foreground">No study plan available.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">
                    PREPARATION ROADMAP
                </p>
                <h3 className="font-sans text-xl font-light">Study Plan</h3>
            </div>

            {/* Weekly Plan */}
            {data.weeks && data.weeks.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-accent" />
                        <h4 className="font-mono text-sm tracking-wider">
                            {data.weeks.length}-Week Plan
                        </h4>
                    </div>

                    {data.weeks.map((week, index) => (
                        <motion.div
                            key={week.week}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="p-5 bg-card/50 border-border/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <Badge className="bg-accent/20 text-accent border-accent/30">
                                        Week {week.week}
                                    </Badge>
                                    <h5 className="font-mono text-sm tracking-wider flex-1">
                                        {week.focus}
                                    </h5>
                                </div>

                                {/* Tasks */}
                                {week.tasks && week.tasks.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {week.tasks.map((task, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-2 p-2 rounded-lg hover:bg-background/20 transition-colors"
                                            >
                                                <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                <span className="font-mono text-xs text-muted-foreground flex-1">
                                                    {task.task}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Resources */}
                                {week.resources && week.resources.length > 0 && (
                                    <div className="pt-3 border-t border-border/30">
                                        <p className="font-mono text-[10px] tracking-wider text-muted-foreground mb-2">
                                            Resources
                                        </p>
                                        <div className="space-y-1">
                                            {week.resources.map((resource, idx) => (
                                                <div key={idx} className="flex items-start gap-2">
                                                    <span className="text-blue-400 text-xs">→</span>
                                                    <span className="font-mono text-xs text-muted-foreground">
                                                        {resource}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Daily Practice */}
            {data.dailyPractice && data.dailyPractice.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <h4 className="font-mono text-sm tracking-wider">Daily Practice</h4>
                    </div>
                    <div className="space-y-2">
                        {data.dailyPractice.map((practice, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/30"
                            >
                                <span className="text-green-400 font-mono text-xs mt-0.5">✓</span>
                                <span className="font-mono text-sm text-muted-foreground flex-1">
                                    {practice}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Final Week Tips */}
            {data.finalWeekTips && data.finalWeekTips.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Book className="w-5 h-5 text-blue-400" />
                        <h4 className="font-mono text-sm tracking-wider">Final Week Tips</h4>
                    </div>
                    <div className="space-y-2">
                        {data.finalWeekTips.map((tip, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/30"
                            >
                                <span className="text-blue-400 font-mono text-xs mt-0.5">💡</span>
                                <span className="font-mono text-sm text-muted-foreground flex-1">
                                    {tip}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
