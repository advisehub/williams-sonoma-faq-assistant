import { UpstashVector } from "@upstash/vector"

export const runtime = "nodejs"

// Initialize Upstash Vector client
const vectorDb = new UpstashVector({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""

    // Get database info
    const info = await vectorDb.info()

    let vectors = []

    if (search) {
      // If there's a search term, do a semantic search
      try {
        const { embed } = await import("ai")
        const { openai } = await import("@ai-sdk/openai")

        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: search,
        })

        const results = await vectorDb.query({
          vector: embedding,
          topK: limit,
          includeMetadata: true,
          includeVectors: false,
        })

        vectors = results.map((result) => ({
          id: result.id,
          score: result.score,
          metadata: result.metadata,
        }))
      } catch (error) {
        console.error("Search error:", error)
        return Response.json({ error: "Search failed", success: false }, { status: 500 })
      }
    } else {
      // Try to get some sample vectors by doing a dummy query
      try {
        const dummyVector = new Array(info.dimension || 1536).fill(0.1)
        const results = await vectorDb.query({
          vector: dummyVector,
          topK: limit,
          includeMetadata: true,
          includeVectors: false,
        })

        vectors = results.map((result) => ({
          id: result.id,
          score: result.score,
          metadata: result.metadata,
        }))
      } catch (error) {
        console.error("Browse error:", error)
        vectors = []
      }
    }

    return Response.json({
      success: true,
      info,
      vectors,
      totalFound: vectors.length,
      searchTerm: search,
    })
  } catch (error) {
    console.error("Error browsing vectors:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vectorId = searchParams.get("id")

    if (!vectorId) {
      return Response.json({ error: "Vector ID required", success: false }, { status: 400 })
    }

    await vectorDb.delete(vectorId)

    return Response.json({
      success: true,
      message: `Vector ${vectorId} deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting vector:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
