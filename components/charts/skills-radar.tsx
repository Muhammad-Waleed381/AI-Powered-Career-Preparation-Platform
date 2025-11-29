"use client"

import { motion } from "framer-motion"
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
} from "recharts"

interface SkillsRadarProps {
    profile?: any
}

export function SkillsRadar({ profile }: SkillsRadarProps) {
    // Calculate skill metrics from profile
    const getSkillData = () => {
        if (!profile) {
            return [
                { subject: "Technical", value: 0, fullMark: 100 },
                { subject: "Experience", value: 0, fullMark: 100 },
                { subject: "Education", value: 0, fullMark: 100 },
                { subject: "Projects", value: 0, fullMark: 100 },
            ]
        }

        // Get skills from profile (handle both formats)
        const technicalSkills = profile.skills?.technical?.length || 0
        const frameworks = profile.skills?.frameworks?.length || 0
        const tools = profile.skills?.tools?.length || 0
        const totalTechSkills = technicalSkills + frameworks + tools
        
        const experienceCount = profile.experience?.length || 0
        const educationCount = profile.education?.length || 0
        const projectsCount = profile.projects?.length || 0
        const yearsExp = profile.total_years_experience || 0

        // Normalize to 0-100 scale with better thresholds
        const technicalScore = Math.min(100, Math.max(0, (totalTechSkills / 25) * 100))
        const experienceScore = Math.min(100, Math.max(0, ((experienceCount * 2 + yearsExp * 10) / 20) * 100))
        const educationScore = Math.min(100, Math.max(0, (educationCount / 3) * 100))
        const projectsScore = Math.min(100, Math.max(0, (projectsCount / 8) * 100))

        return [
            { subject: "Technical", value: Math.round(technicalScore), fullMark: 100 },
            { subject: "Experience", value: Math.round(experienceScore), fullMark: 100 },
            { subject: "Education", value: Math.round(educationScore), fullMark: 100 },
            { subject: "Projects", value: Math.round(projectsScore), fullMark: 100 },
        ]
    }

    const data = getSkillData()
    const hasData = profile && (data.some(d => d.value > 0))

    return (
        <div className="relative h-full flex flex-col items-center justify-center">
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
                SKILLS STRENGTH
            </p>

            {hasData ? (
                <>
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={data}>
                                <PolarGrid stroke="#ffffff20" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: "#a1a1aa", fontSize: 12, fontFamily: "monospace" }}
                                />
                                <Radar
                                    name="Skills"
                                    dataKey="value"
                                    stroke="#8b5cf6"
                                    fill="#8b5cf6"
                                    fillOpacity={0.5}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-2 text-center">
                        <p className="font-mono text-xs text-muted-foreground">
                            {profile.updated_at 
                                ? `Updated ${new Date(profile.updated_at).toLocaleDateString()}`
                                : "From your resume"
                            }
                        </p>
                    </div>
                </>
            ) : (
                <div className="w-full h-56 flex items-center justify-center">
                    <p className="font-mono text-xs text-muted-foreground">
                        Upload resume to see skills
                    </p>
                </div>
            )}
        </div>
    )
}
