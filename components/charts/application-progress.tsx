"use client"

import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

interface ApplicationProgressProps {
    current: number
    goal: number
}

export function ApplicationProgress({ current, goal }: ApplicationProgressProps) {
    const percentage = Math.round((current / goal) * 100)

    return (
        <div className="relative h-full flex flex-col items-center justify-center px-4">
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-6">
                MONTHLY GOAL
            </p>

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-6"
            >
                <p className="text-5xl font-light mb-2">
                    {current}
                    <span className="text-2xl text-muted-foreground">/{goal}</span>
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                    Applications Sent
                </p>
            </motion.div>

            <div className="w-full space-y-4">
                <div className="relative">
                    <Progress value={percentage} className="h-2" />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-muted-foreground">
                        {percentage}% Complete
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                        {goal - current} remaining
                    </span>
                </div>
            </div>

            <div className="mt-6 space-y-2 w-full">
                <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-muted-foreground">This Week</span>
                    <span className="font-mono text-xs text-foreground">12</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-muted-foreground">Best Day</span>
                    <span className="font-mono text-xs text-foreground">5 apps</span>
                </div>
            </div>
        </div>
    )
}
