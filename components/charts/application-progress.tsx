"use client"

import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { JobMatch } from "@/lib/job-matching-service"

interface ApplicationProgressProps {
    jobs?: JobMatch[]
    goal?: number
}

export function ApplicationProgress({ jobs = [], goal = 20 }: ApplicationProgressProps) {
    // Calculate applications from jobs (jobs with high match scores are likely applied)
    const appliedJobs = jobs.filter(job => job.matchScore >= 80).length
    const current = appliedJobs || jobs.length
    const percentage = Math.round((current / goal) * 100)

    return (
        <div className="relative h-full flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-8">
                MONTHLY GOAL
            </p>

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-10 w-full"
            >
                <p className="text-7xl md:text-8xl font-light mb-4">
                    {current}
                    <span className="text-4xl md:text-5xl text-muted-foreground">/{goal}</span>
                </p>
                <p className="font-mono text-base md:text-lg text-muted-foreground">
                    Applications Sent
                </p>
            </motion.div>

            <div className="w-full max-w-2xl space-y-6 mb-8">
                <div className="relative">
                    <Progress value={percentage} className="h-4" />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <span className="font-mono text-base text-muted-foreground">
                        {percentage}% Complete
                    </span>
                    <span className="font-mono text-base text-muted-foreground">
                        {Math.max(0, goal - current)} remaining
                    </span>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 w-full max-w-md">
                <div className="text-center">
                    <p className="font-mono text-sm text-muted-foreground mb-2">High Match Jobs</p>
                    <p className="font-mono text-2xl text-foreground font-medium">{appliedJobs}</p>
                </div>
                <div className="text-center">
                    <p className="font-mono text-sm text-muted-foreground mb-2">Total Discovered</p>
                    <p className="font-mono text-2xl text-foreground font-medium">{jobs.length}</p>
                </div>
            </div>
        </div>
    )
}
