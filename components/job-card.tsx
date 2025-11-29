"use client"

import { motion } from "framer-motion"
import { Briefcase, MapPin, Clock, ExternalLink, CheckCircle2, XCircle, TrendingUp, Link2, Building2, Linkedin } from "lucide-react"
import { JobMatch } from "@/lib/job-matching-service"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface JobCardProps {
  match: JobMatch
  index: number
}

export function JobCard({ match, index }: JobCardProps) {
  const { job, matchScore, explanation, matchedSkills, missingSkills, skillBreakdown } = match

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-orange-400"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/20"
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20"
    return "bg-orange-500/10 border-orange-500/20"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="relative p-5 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm hover:bg-card/70 hover:border-border transition-all duration-300 group h-full flex flex-col">
        {/* Match Score Badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full border ${getScoreBgColor(matchScore)}`}>
          <div className="flex items-center gap-1.5">
            <TrendingUp className={`w-3.5 h-3.5 ${getScoreColor(matchScore)}`} />
            <span className={`font-mono text-xs font-semibold ${getScoreColor(matchScore)}`}>
              {matchScore}%
            </span>
          </div>
        </div>

        {/* Job Header */}
        <div className="pr-20 mb-3">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="font-sans text-lg font-semibold mb-2 group-hover:text-accent transition-colors cursor-pointer hover:underline line-clamp-2">
              {job.title}
            </h3>
          </a>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <a
              href={job.companyUrl || `https://www.google.com/search?q=${encodeURIComponent(job.company)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-accent transition-colors cursor-pointer"
              data-cursor-hover
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hover:underline truncate max-w-[120px]">{job.company}</span>
            </a>
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">{job.location}</span>
              </div>
            )}
            {job.type && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="capitalize text-[10px]">{job.type}</span>
              </div>
            )}
          </div>
        </div>

        {/* Match Explanation */}
        <div className="mb-3 p-2.5 rounded-lg bg-muted/20 border border-border/30">
          <p className="font-mono text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
            {explanation}
          </p>
        </div>

        {/* Skills Section */}
        <div className="mb-3 flex-1">
          <p className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground mb-2">
            REQUIRED SKILLS
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skillBreakdown.slice(0, 8).map((skill, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className={`text-[10px] px-1.5 py-0.5 ${
                  skill.matched
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                <div className="flex items-center gap-1">
                  {skill.matched ? (
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  ) : (
                    <XCircle className="w-2.5 h-2.5" />
                  )}
                  <span className="truncate max-w-[80px]">{skill.skill}</span>
                </div>
              </Badge>
            ))}
            {skillBreakdown.length > 8 && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0.5">
                +{skillBreakdown.length - 8}
              </Badge>
            )}
          </div>
        </div>

        {/* Skills Summary */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
          <div className="p-1.5 rounded bg-green-500/5 border border-green-500/10">
            <div className="font-mono text-green-400 mb-0.5 text-[9px]">Matched</div>
            <div className="text-foreground font-semibold text-xs">
              {matchedSkills.length} / {job.skills.length}
            </div>
          </div>
          <div className="p-1.5 rounded bg-red-500/5 border border-red-500/10">
            <div className="font-mono text-red-400 mb-0.5 text-[9px]">Missing</div>
            <div className="text-foreground font-semibold text-xs">
              {missingSkills.length}
            </div>
          </div>
        </div>

        {/* Job Description Preview */}
        {job.description && (
          <div className="mb-3">
            <p className="font-sans text-xs text-muted-foreground line-clamp-2">
              {job.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-border/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="font-mono">Source:</span>
              <span className="capitalize">{job.source}</span>
              {job.postedDate && (
                <>
                  <span className="mx-1">•</span>
                  <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Quick Apply Button */}
            {job.applyUrl && (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/50 bg-accent/10 hover:bg-accent/20 hover:border-accent transition-all duration-300 font-mono text-[10px] text-accent"
                data-cursor-hover
              >
                <span>Apply</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            
            {/* Links Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 hover:bg-muted/50 hover:border-accent/50 transition-all duration-300 font-mono text-[10px]"
                  data-cursor-hover
                >
                  <span>Links</span>
                  <Link2 className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover/95 backdrop-blur-sm border-border/50">
                <DropdownMenuItem asChild>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Job Posting</span>
                  </a>
                </DropdownMenuItem>
                {job.applyUrl && (
                  <DropdownMenuItem asChild>
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Apply Directly</span>
                    </a>
                  </DropdownMenuItem>
                )}
                {job.companyUrl && (
                  <DropdownMenuItem asChild>
                    <a
                      href={job.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Company Website</span>
                    </a>
                  </DropdownMenuItem>
                )}
                {job.linkedinUrl && (
                  <DropdownMenuItem asChild>
                    <a
                      href={job.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn Company</span>
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <a
                    href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(job.company + ' ' + job.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>Find Employees on LinkedIn</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

