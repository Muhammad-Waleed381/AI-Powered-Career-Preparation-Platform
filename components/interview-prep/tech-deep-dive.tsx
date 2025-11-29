"use client"

import { motion } from "framer-motion"
import { Code2, ExternalLink } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

interface TechDeepDiveProps {
    data: Array<{
        name: string
        category: string
        description: string
        keyTopics: string[]
        commonPatterns: string[]
        resources: Array<{
            title: string
            url: string
            type: string
        }>
    }>
}

export function TechDeepDive({ data }: TechDeepDiveProps) {
    if (!data || data.length === 0) {
        return <div className="text-center p-4 text-muted-foreground">No technology insights available.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">
                    TECHNICAL INTEL
                </p>
                <h3 className="font-sans text-xl font-light">Technology Deep Dive</h3>
            </div>

            <Accordion type="multiple" className="space-y-4">
                {data.map((tech, index) => (
                    <AccordionItem
                        key={tech.name}
                        value={tech.name}
                        className="border border-border/50 rounded-lg bg-card/50 px-6"
                    >
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <span className="font-mono text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="text-left">
                                    <span className="font-mono text-sm tracking-wider block">{tech.name}</span>
                                    <Badge variant="outline" className="font-mono text-[10px] mt-1">
                                        {tech.category}
                                    </Badge>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pb-6">
                            {/* Description */}
                            <div>
                                <p className="font-mono text-xs text-muted-foreground">{tech.description}</p>
                            </div>

                            {/* Key Topics */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Code2 className="w-4 h-4 text-green-400" />
                                    <h5 className="font-mono text-xs tracking-wider text-green-400">
                                        Key Topics
                                    </h5>
                                </div>
                                <ul className="space-y-2 ml-6">
                                    {tech.keyTopics?.map((topic, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-green-400 mt-1">→</span>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {topic}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Common Patterns */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Code2 className="w-4 h-4 text-blue-400" />
                                    <h5 className="font-mono text-xs tracking-wider text-blue-400">
                                        Common Patterns
                                    </h5>
                                </div>
                                <ul className="space-y-2 ml-6">
                                    {tech.commonPatterns?.map((pattern, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-blue-400 mt-1">✓</span>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {pattern}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Resources */}
                            {tech.resources && tech.resources.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <ExternalLink className="w-4 h-4 text-accent" />
                                        <h5 className="font-mono text-xs tracking-wider text-accent">
                                            Resources
                                        </h5>
                                    </div>
                                    <div className="space-y-2 ml-6">
                                        {tech.resources.map((resource, idx) => (
                                            <a
                                                key={idx}
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-start gap-2 p-2 rounded-lg hover:bg-background/50 transition-colors group"
                                            >
                                                <span className="text-accent mt-1">🔗</span>
                                                <div className="flex-1">
                                                    <span className="font-mono text-xs text-foreground group-hover:text-accent transition-colors">
                                                        {resource.title}
                                                    </span>
                                                    <Badge variant="outline" className="font-mono text-[9px] ml-2">
                                                        {resource.type}
                                                    </Badge>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
