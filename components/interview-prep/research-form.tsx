"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ResearchFormProps {
    onSubmit: (data: { company: string; role: string; technologies: string[] }) => void
    isLoading: boolean
}

export function ResearchForm({ onSubmit, isLoading }: ResearchFormProps) {
    const [company, setCompany] = useState("")
    const [role, setRole] = useState("")
    const [techInput, setTechInput] = useState("")
    const [technologies, setTechnologies] = useState<string[]>([])

    const handleAddTech = () => {
        if (techInput.trim() && !technologies.includes(techInput.trim())) {
            setTechnologies([...technologies, techInput.trim()])
            setTechInput("")
        }
    }

    const handleRemoveTech = (tech: string) => {
        setTechnologies(technologies.filter((t) => t !== tech))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (company && role && technologies.length > 0) {
            onSubmit({ company, role, technologies })
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAddTech()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm"
        >
            <div className="mb-6">
                <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-2">
                    RESEARCH BRIEF
                </p>
                <h2 className="font-sans text-2xl font-light">
                    Interview Preparation Research
                </h2>
                <p className="font-mono text-xs text-muted-foreground mt-2">
                    AI will analyze company culture, role requirements, and generate tailored interview questions
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name */}
                <div className="space-y-2">
                    <Label htmlFor="company" className="font-mono text-xs tracking-wider">
                        Target Company
                    </Label>
                    <Input
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g., Google, Meta, Amazon"
                        className="bg-card/50 border-border/50"
                        disabled={isLoading}
                        required
                    />
                </div>

                {/* Role */}
                <div className="space-y-2">
                    <Label htmlFor="role" className="font-mono text-xs tracking-wider">
                        Role / Position
                    </Label>
                    <Input
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g., Senior Frontend Engineer"
                        className="bg-card/50 border-border/50"
                        disabled={isLoading}
                        required
                    />
                </div>

                {/* Technologies */}
                <div className="space-y-2">
                    <Label htmlFor="tech" className="font-mono text-xs tracking-wider">
                        Key Technologies
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="tech"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g., React, Node.js, TypeScript"
                            className="bg-card/50 border-border/50"
                            disabled={isLoading}
                        />
                        <Button
                            type="button"
                            onClick={handleAddTech}
                            disabled={!techInput.trim() || isLoading}
                            className="px-4"
                            variant="outline"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Tech Tags */}
                    {technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {technologies.map((tech) => (
                                <motion.div
                                    key={tech}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30"
                                >
                                    <span className="font-mono text-xs text-accent">{tech}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTech(tech)}
                                        className="hover:bg-purple-500/30 rounded-full p-0.5 transition-colors"
                                        disabled={isLoading}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    <p className="font-mono text-[10px] text-muted-foreground">
                        Add up to 10 technologies • Press Enter or click + to add
                    </p>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={!company || !role || technologies.length === 0 || isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 font-mono text-xs tracking-wider"
                    size="lg"
                >
                    {isLoading ? "RESEARCHING..." : "START DEEP RESEARCH"}
                </Button>
            </form>
        </motion.div>
    )
}
