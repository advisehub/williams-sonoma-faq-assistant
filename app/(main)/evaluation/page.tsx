"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Download, BarChart2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type EvaluationResult = {
  question: string
  answer: string
  relevantFAQs: Array<{
    question: string
    answer: string
    similarity: number
  }>
  evaluation: {
    factualAccuracy: number
    relevance: number
    completeness: number
    staysWithinFAQScope: number
    overallScore: number
    feedback: string
  }
}

export default function EvaluationPage() {
  const [results, setResults] = useState<EvaluationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [averageScores, setAverageScores] = useState({
    factualAccuracy: 0,
    relevance: 0,
    completeness: 0,
    staysWithinFAQScope: 0,
    overallScore: 0,
  })

  const runEvaluation = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/evaluate")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Evaluation failed")
      }

      setResults(data.results || [])

      // Calculate average scores
      if (data.results && data.results.length > 0) {
        const avgScores = {
          factualAccuracy: 0,
          relevance: 0,
          completeness: 0,
          staysWithinFAQScope: 0,
          overallScore: 0,
        }

        data.results.forEach((result: EvaluationResult) => {
          avgScores.factualAccuracy += result.evaluation.factualAccuracy
          avgScores.relevance += result.evaluation.relevance
          avgScores.completeness += result.evaluation.completeness
          avgScores.staysWithinFAQScope += result.evaluation.staysWithinFAQScope
          avgScores.overallScore += result.evaluation.overallScore
        })

        const count = data.results.length
        Object.keys(avgScores).forEach((key) => {
          avgScores[key as keyof typeof avgScores] /= count
        })

        setAverageScores(avgScores)
      }
    } catch (error) {
      console.error("Error running evaluation:", error)
      // Set some default state to show error
      setResults([])
      setAverageScores({
        factualAccuracy: 0,
        relevance: 0,
        completeness: 0,
        staysWithinFAQScope: 0,
        overallScore: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = async () => {
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to generate CSV")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "williams-sonoma-faq-evaluation.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error("Error downloading CSV:", error)
    }
  }

  useEffect(() => {
    runEvaluation()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-4 md:p-24 bg-gray-50">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Williams-Sonoma FAQ Assistant Evaluation</CardTitle>
              <CardDescription>Evaluating the performance of the RAG-based FAQ assistant</CardDescription>
            </div>
            <Button variant="outline" onClick={downloadCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Running evaluation...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                  <BarChart2 className="h-5 w-5" />
                  Overall Performance
                </h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Factual Accuracy</span>
                    <span className="text-sm font-medium">{averageScores.factualAccuracy.toFixed(1)}/10</span>
                  </div>
                  <Progress value={averageScores.factualAccuracy * 10} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Relevance</span>
                    <span className="text-sm font-medium">{averageScores.relevance.toFixed(1)}/10</span>
                  </div>
                  <Progress value={averageScores.relevance * 10} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completeness</span>
                    <span className="text-sm font-medium">{averageScores.completeness.toFixed(1)}/10</span>
                  </div>
                  <Progress value={averageScores.completeness * 10} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Stays Within FAQ Scope</span>
                    <span className="text-sm font-medium">{averageScores.staysWithinFAQScope.toFixed(1)}/10</span>
                  </div>
                  <Progress value={averageScores.staysWithinFAQScope * 10} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium font-bold">Overall Score</span>
                    <span className="text-sm font-medium font-bold">{averageScores.overallScore.toFixed(1)}/10</span>
                  </div>
                  <Progress value={averageScores.overallScore * 10} className="h-2" />
                </div>
              </div>

              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Question</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{result.question}</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <p>{result.answer}</p>
                            <div>
                              <Badge variant="outline" className="mr-1">
                                Accuracy: {result.evaluation.factualAccuracy}/10
                              </Badge>
                              <Badge variant="outline" className="mr-1">
                                Relevance: {result.evaluation.relevance}/10
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{result.evaluation.feedback}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`text-lg font-bold ${getScoreColor(result.evaluation.overallScore)}`}>
                            {result.evaluation.overallScore}/10
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">Using Upstash Vector and OpenAI GPT-4o</p>
          <Button onClick={runEvaluation} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              "Run Evaluation Again"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
