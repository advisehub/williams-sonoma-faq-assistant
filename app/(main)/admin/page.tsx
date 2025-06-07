"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, RefreshCw, Trash2, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

type VectorStats = {
  databaseInfo: {
    vectorCount: number
    dimension: number
    similarityFunction: string
  }
  totalVectors: number
  dimension: number
  sampleData: Array<{
    id: string
    score: number
    question: string
    source: string
    timestamp: string
  }>
  lastUpdated: string
}

export default function AdminPage() {
  const [stats, setStats] = useState<VectorStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/vector-stats")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch stats")
      }

      setStats(data.stats)
    } catch (error) {
      console.error("Error fetching stats:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const runScraper = async () => {
    setLoading(true)
    try {
      // This would trigger the scraping script
      const response = await fetch("/api/scrape-faq", {
        method: "POST",
      })

      if (response.ok) {
        await fetchStats() // Refresh stats after scraping
      }
    } catch (error) {
      console.error("Error running scraper:", error)
      setError("Failed to run scraper")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-4 md:p-24 bg-gray-50">
      <div className="w-full max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Vector Database Administration
                </CardTitle>
                <CardDescription>Monitor and manage your Williams-Sonoma FAQ vector data</CardDescription>
              </div>
              <Button onClick={fetchStats} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading && !stats ? (
              <div className="flex justify-center items-center h-32">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading vector database stats...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">Error: {error}</div>
                <p className="text-sm text-muted-foreground mb-4">
                  Make sure your Upstash Vector credentials are configured:
                </p>
                <div className="text-xs bg-gray-100 p-3 rounded font-mono">
                  UPSTASH_VECTOR_REST_URL=your_url_here
                  <br />
                  UPSTASH_VECTOR_REST_TOKEN=your_token_here
                </div>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Database Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{stats.totalVectors}</div>
                      <p className="text-xs text-muted-foreground">Total Vectors</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{stats.dimension}</div>
                      <p className="text-xs text-muted-foreground">Vector Dimension</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{stats.databaseInfo.similarityFunction || "cosine"}</div>
                      <p className="text-xs text-muted-foreground">Similarity Function</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sample Data */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Sample FAQ Data</h3>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Question</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.sampleData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">{item.id}</TableCell>
                            <TableCell className="max-w-md truncate">{item.question}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.source}</Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button onClick={runScraper} disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    Re-scrape FAQ Data
                  </Button>
                  <Button variant="destructive" disabled={loading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Database
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(stats.lastUpdated).toLocaleString()}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
