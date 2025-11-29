"use client"

import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
    { date: "30/10", score: 87 },
    { date: "31/10", score: 85 },
    { date: "01/11", score: 89 },
    { date: "02/11", score: 92 },
    { date: "03/11", score: 90 },
    { date: "04/11", score: 88 },
    { date: "05/11", score: 91 },
]

export function MatchTrendChart() {
    const currentScore = data[data.length - 1].score

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
                        <span className="font-mono text-xs text-green-500">+5% ↑</span>
                    </div>
                </div>
            </div>

            <div className="h-64">
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
                            fontSize={10}
                            fontFamily="monospace"
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#71717a"
                            fontSize={10}
                            fontFamily="monospace"
                            tickLine={false}
                            axisLine={false}
                            domain={[80, 95]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#18181b",
                                border: "1px solid #27272a",
                                borderRadius: "8px",
                                fontFamily: "monospace",
                                fontSize: "11px",
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fill="url(#scoreGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <p className="font-mono text-xs text-muted-foreground mt-4 text-center">
                Last 7 days • Updated as you improve your profile
            </p>
        </div>
    )
}
