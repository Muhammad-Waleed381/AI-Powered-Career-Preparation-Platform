"use client"

import { motion } from "framer-motion"
import { Building2, Sparkles, Newspaper, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

interface CompanyInsightsProps {
    data: {
        overview: string
        culture: string
        recentNews: string[]
        interviewProcess: string
        keyFocusAreas: string[]
    }
}

export function CompanyInsights({ data }: CompanyInsightsProps) {
    if (!data) {
        return <div className="text-center p-4 text-muted-foreground">No company insights available.</div>
    }

    // Helper to ensure array
    const toArray = (val: any) => Array.isArray(val) ? val : [val].filter(Boolean);

    const sections = [
        {
            title: "Overview & Culture",
            icon: Building2,
            items: [data.overview, data.culture].filter(Boolean),
            color: "purple",
        },
        {
            title: "Key Focus Areas",
            icon: Sparkles,
            items: toArray(data.keyFocusAreas),
            color: "blue",
        },
        {
            title: "Interview Process",
            icon: Zap,
            items: [data.interviewProcess].filter(Boolean),
            color: "green",
        },
        {
            title: "Recent News",
            icon: Newspaper,
            items: toArray(data.recentNews),
            color: "orange",
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">
                    COMPANY INTEL
                </p>
                <h3 className="font-sans text-xl font-light">What You Need to Know</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section, index) => {
                    const Icon = section.icon
                    return (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="p-5 bg-card/50 border-border/50 hover:bg-card/70 transition-all h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-lg bg-${section.color}-500/20 border border-${section.color}-500/30`}>
                                        <Icon className={`w-4 h-4 text-${section.color}-400`} />
                                    </div>
                                    <h4 className="font-mono text-sm tracking-wider">{section.title}</h4>
                                </div>
                                <ul className="space-y-2">
                                    {section.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className={`text-${section.color}-400 mt-1`}>•</span>
                                            <span className="font-mono text-xs text-muted-foreground flex-1">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
