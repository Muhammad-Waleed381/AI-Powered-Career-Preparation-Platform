"use client"

import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { JobMatch } from "@/lib/job-matching-service"

interface MatchTrendChartProps {
    jobs?: JobMatch[]
}

export function MatchTrendChart({ jobs = [] }: MatchTrendChartProps) {
    const getTrendData = () => {
        if (!jobs || jobs.length === 0) {
            // Return empty data if no jobs
            return []
        }

        // Sort jobs by match score and create trend data
        const sortedJobs = [...jobs]
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 7)
            .reverse()

        return sortedJobs.map((job, index) => {
            const date = new Date()
            date.setDate(date.getDate() - (sortedJobs.length - index - 1))
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                score: job.matchScore
            }
        })
    }

    const data = getTrendData()
    const hasData = data.length > 0
    const currentScore = hasData ? data[data.length - 1].score : 0
    const previousScore = hasData && data.length > 1 ? data[data.length - 2].score : currentScore
    const scoreChange = currentScore - previousScore

    if (!hasData) {
        return (
            <div className="relative h-full flex flex-col items-center justify-center">
                <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
                    MATCH SCORE TREND
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                    Discover jobs to see match trends
                </p>
            </div>
        )
    }

    const minScore = Math.max(0, Math.min(...data.map(d => d.score)) - 10)
    const maxScore = Math.min(100, Math.max(...data.map(d => d.score)) + 10)

    return (
        <div className="relative h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">
                        MATCH SCORE TREND
                    </p>
                    <div className="flex items-baseline gap-2">
                        <motion.p
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-4xl font-light"
                        >
                            {currentScore}%
                        </motion.p>
                        {scoreChange !== 0 && (
                            <span className={`font-mono text-xs ${scoreChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {scoreChange > 0 ? '+' : ''}{scoreChange}% {scoreChange > 0 ? '↑' : '↓'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            stroke="#71717a"
                            fontSize={12}
                            fontFamily="monospace"
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#71717a"
                            fontSize={12}
                            fontFamily="monospace"
                            tickLine={false}
                            axisLine={false}
                            domain={[minScore, maxScore]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                fontFamily: "monospace",
                                fontSize: "12px",
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fill="url(#scoreGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <p className="font-mono text-xs text-muted-foreground mt-4 text-center">
                Top {data.length} job matches • Based on your profile
            </p>
        </div>
    )
}
