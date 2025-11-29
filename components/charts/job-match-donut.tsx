"use client"

import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface JobMatchDonutProps {
    score: number
}

export function JobMatchDonut({ score }: JobMatchDonutProps) {
    const data = [
        { name: "Match", value: score },
        { name: "Remaining", value: 100 - score },
    ]

    const COLORS = ["#8b5cf6", "#27272a"]

    return (
        <div className="relative h-full flex flex-col items-center justify-center">
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
                OVERALL MATCH
            </p>

            <div className="relative w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={90}
                            outerRadius={130}
                            paddingAngle={0}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-center"
                    >
                        <p className="text-5xl font-light">{score}%</p>
                        <p className="font-mono text-xs text-muted-foreground mt-2">
                            SCORE
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="mt-4 text-center">
                <p className="font-mono text-xs text-muted-foreground">
                    Based on your profile
                </p>
            </div>
        </div>
    )
}
