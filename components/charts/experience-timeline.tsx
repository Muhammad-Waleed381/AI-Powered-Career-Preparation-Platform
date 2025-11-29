"use client"

import { motion } from "framer-motion"
import { Briefcase } from "lucide-react"

interface ExperienceTimelineProps {
    profile?: any
}

export function ExperienceTimeline({ profile }: ExperienceTimelineProps) {
    const getExperienceData = () => {
        if (!profile) return []

        const experience = profile.experience || []
        
        return experience
            .slice(0, 5)
            .map((exp: any) => {
                const startDate = new Date(exp.startDate || exp.start_date || Date.now())
                const endDate = exp.endDate && exp.endDate !== 'Present' 
                    ? new Date(exp.endDate || exp.end_date) 
                    : new Date()
                
                const months = Math.round(
                    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
                )
                const years = Math.floor(months / 12)
                const remainingMonths = months % 12
                
                return {
                    title: exp.title || exp.position || 'Position',
                    company: exp.company || 'Company',
                    duration: years > 0 
                        ? `${years}yr ${remainingMonths > 0 ? remainingMonths + 'mo' : ''}`.trim()
                        : `${months}mo`,
                    startDate: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    endDate: exp.endDate === 'Present' || !exp.endDate 
                        ? 'Present' 
                        : new Date(exp.endDate || exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                }
            })
    }

    const experienceData = getExperienceData()
    const hasData = experienceData.length > 0

    return (
        <div className="relative h-full flex flex-col">
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-6">
                EXPERIENCE TIMELINE
            </p>

            {hasData ? (
                <div className="space-y-6 flex-1">
                    {experienceData.map((exp, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex items-start gap-3"
                        >
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-accent" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-sans text-base font-medium text-foreground truncate mb-1">
                                    {exp.title}
                                </h4>
                                <p className="font-mono text-sm text-muted-foreground truncate mb-2">
                                    {exp.company}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-muted-foreground">
                                        {exp.startDate} - {exp.endDate}
                                    </span>
                                    <span className="font-mono text-xs text-accent">
                                        • {exp.duration}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <p className="font-mono text-xs text-muted-foreground">
                        No experience data
                    </p>
                </div>
            )}
        </div>
    )
}

