import { UpstashVector } from "@upstash/vector"

export const runtime = "nodejs"

// Initialize Upstash Vector client
const vectorDb = new UpstashVector({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

export async function GET() {
  try {
    // Get database info
    const info = await vectorDb.info()

    // Try to query a few sample vectors to see what's stored
    const sampleQuery = await vectorDb.query({
      vector: new Array(info.dimension || 1536).fill(0.1), // Dummy vector for OpenAI embeddings
      topK: 20,
      includeMetadata: true,
      includeVectors: false,
    })

    // Group by category for better organization
    const categorizedData = {}
    sampleQuery.forEach((result) => {
      const category = result.metadata?.category || "Uncategorized"
      if (!categorizedData[category]) {
        categorizedData[category] = []
      }
      categorizedData[category].push(result)
    })

    // Get some statistics
    const stats = {
      databaseInfo: info,
      totalVectors: info.vectorCount || 0,
      dimension: info.dimension || 0,
      sampleData: sampleQuery.map((result) => ({
        id: result.id,
        score: result.score,
        question: result.metadata?.question,
        category: result.metadata?.category,
        source: result.metadata?.source,
        timestamp: result.metadata?.timestamp,
      })),
      categorizedData,
      categories: Object.keys(categorizedData),
      lastUpdated: new Date().toISOString(),
    }

    return Response.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error getting vector stats:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Make sure your Upstash Vector credentials are configured correctly",
      },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    // This would reset/clear the vector database
    // Be careful with this endpoint!

    // Get current info first
    const info = await vectorDb.info()

    // Note: Upstash Vector doesn't have a "clear all" method
    // You would need to delete vectors individually or reset the database

    return Response.json({
      success: true,
      message: "Vector database reset functionality would go here",
      previousCount: info.vectorCount || 0,
    })
  } catch (error) {
    console.error("Error resetting vector database:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
