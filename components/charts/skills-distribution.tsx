"use client"

import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

interface SkillsDistributionProps {
    profile?: any
}

export function SkillsDistribution({ profile }: SkillsDistributionProps) {
    const getSkillsData = () => {
        if (!profile) return []

        const skills = profile.skills || {}
        const technical = skills.technical?.length || 0
        const frameworks = skills.frameworks?.length || 0
        const tools = skills.tools?.length || 0
        const languages = skills.languages?.length || 0
        const soft = skills.soft?.length || 0

        const data = [
            { name: "Technical", value: technical, color: "#8b5cf6" },
            { name: "Frameworks", value: frameworks, color: "#6366f1" },
            { name: "Tools", value: tools, color: "#a855f7" },
            { name: "Languages", value: languages, color: "#ec4899" },
            { name: "Soft Skills", value: soft, color: "#f59e0b" },
        ].filter(item => item.value > 0)

        return data
    }

    const data = getSkillsData()
    const hasData = data.length > 0
    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <div className="relative h-full flex flex-col items-center justify-center">
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
                SKILLS DISTRIBUTION
            </p>

            {hasData ? (
                <>
                    <div className="w-full h-80 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend
                                    wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', marginTop: '20px' }}
                                    iconType="circle"
                                    formatter={(value) => {
                                        const item = data.find(d => d.name === value)
                                        const percentage = item ? Math.round((item.value / total) * 100) : 0
                                        return `${value} (${percentage}%)`
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center">
                        <p className="font-mono text-xs text-muted-foreground">
                            Total: {total} skills
                        </p>
                    </div>
                </>
            ) : (
                <div className="w-full h-48 flex items-center justify-center">
                    <p className="font-mono text-xs text-muted-foreground">
                        No skills data available
                    </p>
                </div>
            )}
        </div>
    )
}

