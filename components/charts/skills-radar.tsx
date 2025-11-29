"use client"

import { motion } from "framer-motion"
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
} from "recharts"

const data = [
    { subject: "Technical", value: 85, fullMark: 100 },
    { subject: "Soft Skills", value: 90, fullMark: 100 },
    { subject: "Experience", value: 75, fullMark: 100 },
    { subject: "Leadership", value: 80, fullMark: 100 },
    { subject: "Domain", value: 88, fullMark: 100 },
]

export function SkillsRadar() {
    return (
        <div className="relative h-full flex flex-col items-center justify-center">
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
                SKILLS STRENGTH
            </p>

            <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data}>
                        <PolarGrid stroke="#ffffff20" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#a1a1aa", fontSize: 11, fontFamily: "monospace" }}
                        />
                        <Radar
                            name="Skills"
                            dataKey="value"
                            stroke="#8b5cf6"
                            fill="#8b5cf6"
                            fillOpacity={0.5}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-2 text-center">
                <p className="font-mono text-xs text-muted-foreground">
                    Updated 2 days ago
                </p>
            </div>
        </div>
    )
}
