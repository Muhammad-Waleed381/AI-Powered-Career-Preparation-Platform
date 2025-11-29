"use client"

import { motion } from "framer-motion"

interface SkillProficiencyProps {
    profile?: any
}

export function SkillProficiency({ profile }: SkillProficiencyProps) {
    const getTopSkills = () => {
        if (!profile) return []

        const skillProficiency = profile.skill_proficiency || profile.analysis?.skillProficiency || []
        
        if (skillProficiency.length > 0) {
            return skillProficiency
                .slice(0, 6)
                .map((skill: any) => ({
                    skill: skill.skill || skill.name || 'Unknown',
                    level: (skill.level || 'intermediate').toLowerCase(),
                    years: skill.yearsOfExperience || 0
                }))
        }

        // Fallback: create from skills array
        const technical = profile.skills?.technical || []
        const frameworks = profile.skills?.frameworks || []
        const allSkills = [...technical, ...frameworks].slice(0, 6)
        
        return allSkills.map((skill: string, idx: number) => ({
            skill,
            level: idx < 2 ? 'advanced' : idx < 4 ? 'intermediate' : 'beginner',
            years: 0
        }))
    }

    const topSkills = getTopSkills()
    const hasData = topSkills.length > 0

    const levelMap: { [key: string]: number } = {
        beginner: 30,
        intermediate: 60,
        advanced: 85,
        expert: 100,
    }

    return (
        <div className="relative h-full flex flex-col">
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-6">
                TOP SKILLS
            </p>

            {hasData ? (
                <div className="space-y-6 flex-1">
                    {topSkills.map((item, index) => {
                        const level = levelMap[item.level] || 50
                        return (
                            <motion.div
                                key={item.skill}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-base font-mono text-foreground font-medium">{item.skill}</span>
                                    <span className="text-sm text-muted-foreground capitalize">
                                        {item.level}
                                        {item.years > 0 && ` • ${item.years}yr`}
                                    </span>
                                </div>
                                <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${level}%` }}
                                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                    />
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <p className="font-mono text-xs text-muted-foreground">
                        No skills data available
                    </p>
                </div>
            )}
        </div>
    )
}

