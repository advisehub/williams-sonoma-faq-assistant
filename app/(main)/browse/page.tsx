"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Loader2, Database, Trash2, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type VectorData = {
  id: string
  score: number
  metadata: {
    question?: string
    answer?: string
    source?: string
    timestamp?: string
  }
}

type BrowseResult = {
  success: boolean
  info: {
    vectorCount: number
    dimension: number
    similarityFunction: string
  }
  vectors: VectorData[]
  totalFound: number
  searchTerm: string
}

export default function BrowsePage() {
  const [data, setData] = useState<BrowseResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  const fetchVectors = async (search = "") => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      params.append("limit", "50")

      const response = await fetch(`/api/vector-browse?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch vectors")
      }

      setData(result)
    } catch (error) {
      console.error("Error fetching vectors:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchVectors(searchTerm)
  }

  const deleteVector = async (vectorId: string) => {
    if (!confirm(`Are you sure you want to delete vector ${vectorId}?`)) return

    try {
      const response = await fetch(`/api/vector-browse?id=${vectorId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        // Refresh the data
        fetchVectors(searchTerm)
      } else {
        alert("Failed to delete vector: " + result.error)
      }
    } catch (error) {
      alert("Error deleting vector: " + error)
    }
  }

  useEffect(() => {
    fetchVectors()
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-4 md:p-24 bg-gray-50">
      <div className="w-full max-w-6xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Vector Database Browser
                </CardTitle>
                <CardDescription>Browse and search your Williams-Sonoma FAQ vectors and chunks</CardDescription>
              </div>
              <Button onClick={() => fetchVectors(searchTerm)} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <Input
                placeholder="Search vectors semantically (e.g., 'order cancellation', 'shipping')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </form>

            {error && (
              <Alert className="mb-6 border-red-500 bg-red-50">
                <AlertDescription>Error: {error}</AlertDescription>
              </Alert>
            )}

            {loading && !data ? (
              <div className="flex justify-center items-center h-32">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading vectors...</p>
                </div>
              </div>
            ) : data ? (
              <>
                {/* Database Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{data.info.vectorCount || 0}</div>
                      <p className="text-xs text-muted-foreground">Total Vectors</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{data.totalFound}</div>
                      <p className="text-xs text-muted-foreground">
                        {data.searchTerm ? "Search Results" : "Vectors Shown"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{data.info.dimension || 0}</div>
                      <p className="text-xs text-muted-foreground">Vector Dimension</p>
                    </CardContent>
                  </Card>
                </div>

                {data.searchTerm && (
                  <Alert className="mb-4 border-blue-500 bg-blue-50">
                    <AlertDescription>
                      Showing semantic search results for: <strong>"{data.searchTerm}"</strong>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Vectors Table */}
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Vector ID</TableHead>
                        <TableHead className="w-[300px]">Question (Chunk)</TableHead>
                        <TableHead>Answer (Chunk)</TableHead>
                        <TableHead className="w-[100px]">Source</TableHead>
                        {data.searchTerm && <TableHead className="w-[80px]">Score</TableHead>}
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.vectors.map((vector, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">{vector.id}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate" title={vector.metadata.question}>
                              {vector.metadata.question || "No question"}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-lg">
                            <div className="truncate" title={vector.metadata.answer}>
                              {vector.metadata.answer || "No answer"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{vector.metadata.source || "unknown"}</Badge>
                          </TableCell>
                          {data.searchTerm && (
                            <TableCell>
                              <Badge variant={vector.score > 0.8 ? "default" : "secondary"}>
                                {vector.score.toFixed(3)}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteVector(vector.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {data.vectors.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {data.searchTerm ? "No vectors found for your search." : "No vectors found in your database."}
                    </p>
                    {!data.searchTerm && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Run the FAQ scraping script to populate your vector database.
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to View Your Vectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">🔍 In This Interface:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Browse all vectors in your database</li>
                  <li>Search semantically (e.g., "order cancellation" will find related FAQs)</li>
                  <li>View the actual FAQ chunks (questions and answers)</li>
                  <li>See similarity scores for search results</li>
                  <li>Delete individual vectors if needed</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">📊 In Upstash Console:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Go to your Vector index in the Upstash console</li>
                  <li>Look for a "Data" or "Browse" tab</li>
                  <li>You can see vector IDs and metadata</li>
                  <li>Limited browsing capabilities compared to this interface</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">🛠️ Via API:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Use the Upstash Vector REST API directly</li>
                  <li>Query with dummy vectors to browse data</li>
                  <li>Use the /info endpoint to get database statistics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
