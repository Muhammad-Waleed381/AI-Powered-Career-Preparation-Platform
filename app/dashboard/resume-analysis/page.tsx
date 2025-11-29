"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, X, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ResumeAnalysisPage() {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string>("")
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const pathname = usePathname()

    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const validateFile = (file: File): string | null => {
        if (file.type !== "application/pdf") {
            return "Please upload a PDF file"
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
        }
        return null
    }

    const processFile = (file: File) => {
        const validationError = validateFile(file)
        if (validationError) {
            setError(validationError)
            return
        }

        setError("")
        setUploadedFile(file)

        // Create preview URL for PDF
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files.length > 0) {
            processFile(files[0])
        }
    }, [])

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            processFile(files[0])
        }
    }

    const handleDelete = () => {
        setUploadedFile(null)
        setPreviewUrl("")
        setError("")
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B"
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
        return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    }

    return (
        <div className="min-h-screen bg-[#050505] p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Resume Analysis
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm">
                        Upload your resume to get AI-powered insights and recommendations
                    </p>
                </motion.div>

                {/* Navigation Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="inline-flex bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-1">
                        <Link href="/dashboard/resume-analysis">
                            <button
                                className={cn(
                                    "px-6 py-2.5 rounded-md font-mono text-xs tracking-wider transition-all duration-300",
                                    pathname === "/dashboard/resume-analysis"
                                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                Resume Analysis
                            </button>
                        </Link>
                        <Link href="/dashboard/resume-analysis/result">
                            <button
                                className={cn(
                                    "px-6 py-2.5 rounded-md font-mono text-xs tracking-wider transition-all duration-300",
                                    pathname === "/dashboard/resume-analysis/result"
                                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                Result
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">PDF Upload & Parsing</h2>
                                <p className="text-xs text-muted-foreground font-mono">
                                    Step 1: Upload your resume
                                </p>
                            </div>
                        </div>

                        {!uploadedFile ? (
                            <div>
                                {/* Drag and Drop Zone */}
                                <label
                                    htmlFor="file-upload"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={cn(
                                        "relative block w-full cursor-pointer transition-all duration-300",
                                        "border-2 border-dashed rounded-xl p-12",
                                        "hover:border-purple-500/50 hover:bg-white/5",
                                        isDragging
                                            ? "border-purple-500 bg-purple-500/10 scale-[1.02]"
                                            : "border-white/20"
                                    )}
                                >
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileInput}
                                        className="hidden"
                                    />

                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <motion.div
                                            animate={{
                                                y: isDragging ? -10 : 0,
                                                scale: isDragging ? 1.1 : 1,
                                            }}
                                            transition={{ duration: 0.2 }}
                                            className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center"
                                        >
                                            <Upload className="w-8 h-8 text-purple-400" />
                                        </motion.div>

                                        <div className="text-center">
                                            <p className="text-lg font-medium mb-1">
                                                {isDragging ? "Drop your resume here" : "Upload Resume (PDF)"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Drag and drop or click to browse
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                                            <div className="flex items-center gap-1">
                                                <Check className="w-3 h-3 text-green-500" />
                                                <span>PDF format</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Check className="w-3 h-3 text-green-500" />
                                                <span>Max 10MB</span>
                                            </div>
                                        </div>
                                    </div>
                                </label>

                                {/* Error Message */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
                                        >
                                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                            <p className="text-sm text-red-400">{error}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                {/* File Preview Card */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-start gap-4">
                                        {/* PDF Thumbnail Preview */}
                                        <div className="flex-shrink-0 w-24 h-32 bg-white/10 rounded-lg border border-white/20 overflow-hidden">
                                            {previewUrl ? (
                                                <iframe
                                                    src={`${previewUrl}#page=1&view=FitH`}
                                                    className="w-full h-full pointer-events-none"
                                                    title="PDF Preview"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FileText className="w-12 h-12 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium truncate mb-1">
                                                        {uploadedFile.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground font-mono">
                                                        {formatFileSize(uploadedFile.size)}
                                                    </p>
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                        <span className="text-xs text-green-400 font-mono">
                                                            Ready for analysis
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2">
                                                    <label
                                                        htmlFor="file-replace"
                                                        className="px-4 py-2 text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        Replace
                                                        <input
                                                            id="file-replace"
                                                            type="file"
                                                            accept=".pdf,application/pdf"
                                                            onChange={handleFileInput}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    <button
                                                        onClick={handleDelete}
                                                        className="p-2 text-red-400 hover:bg-red-500/10 border border-white/10 rounded-lg transition-colors"
                                                        aria-label="Delete file"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Next Steps */}
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
                                    <p className="text-sm font-mono text-muted-foreground">
                                        Ready to analyze your resume
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-mono text-sm font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
                                    >
                                        Analyze Resume
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
