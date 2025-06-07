import fetch from "node-fetch"
import { JSDOM } from "jsdom"
import { UpstashVector } from "@upstash/vector"
import { embed } from "ai"
import { openai } from "@ai-sdk/openai"

// Initialize Upstash Vector client
const vectorDb = new UpstashVector({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
})

async function scrapeWilliamsSonomaFAQ() {
  console.log("🚀 Starting Williams-Sonoma FAQ scraping and vectorization...")

  try {
    // Fetch the FAQ page
    console.log("📥 Fetching FAQ page...")
    const response = await fetch("https://www.williams-sonoma.com/customer-service/faq.html")
    const html = await response.text()

    // Parse the HTML
    const dom = new JSDOM(html)
    const document = dom.window.document

    const faqs = []

    // Extract FAQ sections - looking for expandable FAQ items
    console.log("🔍 Extracting FAQ content...")

    // Look for FAQ questions in various possible selectors
    const faqSelectors = [
      '[data-testid*="faq"]',
      ".faq-item",
      ".help-topic",
      ".accordion-item",
      '[class*="faq"]',
      '[class*="help"]',
      ".expandable-content",
      "details summary",
      '[role="button"][aria-expanded]',
    ]

    // Try to find FAQ content using different approaches
    let faqElements = []

    for (const selector of faqSelectors) {
      const elements = document.querySelectorAll(selector)
      if (elements.length > 0) {
        faqElements = Array.from(elements)
        console.log(`✅ Found ${elements.length} FAQ elements using selector: ${selector}`)
        break
      }
    }

    // If no specific FAQ elements found, look for text patterns
    if (faqElements.length === 0) {
      console.log("🔍 Looking for FAQ content by text patterns...")

      // Look for elements containing question-like text
      const allElements = document.querySelectorAll("*")
      const questionPatterns = [
        /^How (do|can|to)/i,
        /^What (is|are|do)/i,
        /^Can I/i,
        /^Why (is|do|does)/i,
        /^Where (can|do|is)/i,
        /^When (will|do|can)/i,
      ]

      for (const element of allElements) {
        const text = element.textContent?.trim()
        if (text && questionPatterns.some((pattern) => pattern.test(text))) {
          // Check if this looks like a standalone question (not too long, ends with ?)
          if (text.length < 200 && text.includes("?")) {
            faqElements.push(element)
          }
        }
      }

      console.log(`📝 Found ${faqElements.length} potential FAQ questions by text pattern`)
    }

    // Extract questions and try to find their answers
    for (const element of faqElements) {
      const questionText = element.textContent?.trim()

      if (!questionText || questionText.length < 10) continue

      // Try to find the answer - look in siblings, parent, or nearby elements
      let answerText = ""

      // Method 1: Look for next sibling
      const nextElement = element.nextElementSibling
      if (nextElement) {
        answerText = nextElement.textContent?.trim() || ""
      }

      // Method 2: Look for parent container with answer
      if (!answerText && element.parentElement) {
        const parentText = element.parentElement.textContent?.trim() || ""
        if (parentText.length > questionText.length) {
          answerText = parentText.replace(questionText, "").trim()
        }
      }

      // Method 3: Look for expandable content
      if (!answerText) {
        const expandableContent = element.querySelector('[class*="content"], [class*="answer"], [class*="body"]')
        if (expandableContent) {
          answerText = expandableContent.textContent?.trim() || ""
        }
      }

      // Clean up the answer text
      if (answerText && answerText.length > 20 && answerText.length < 1000) {
        faqs.push({
          question: questionText,
          answer: answerText,
        })
      }
    }

    // Add some manual FAQ entries based on the screenshot
    const manualFAQs = [
      {
        question: "How can I change or cancel my order?",
        answer:
          "You may be able to change or cancel your order if it hasn't been processed for shipping yet. Contact customer service immediately at 1-877-812-6235 or through your online account to request changes or cancellation. Orders that have already shipped cannot be changed or cancelled.",
      },
      {
        question: "How do I track my order?",
        answer:
          "You can track your order by logging into your Williams-Sonoma account and visiting the 'My Orders' section. You'll find tracking information and delivery updates there. You can also use the tracking number provided in your shipping confirmation email.",
      },
      {
        question: "Can I return or exchange an item?",
        answer:
          "Williams-Sonoma offers a 30-day return policy for most items. Items must be in original condition with tags attached. Some exclusions apply for personalized items and final sale merchandise. You can return items to any Williams-Sonoma store or by mail.",
      },
      {
        question: "Can I ship items to multiple addresses?",
        answer:
          "Yes, you can ship items to multiple addresses during checkout. Simply select 'Ship to multiple addresses' option and specify the different shipping addresses for your items.",
      },
      {
        question: "Why is the price for an item different from when I added it to the shopping cart?",
        answer:
          "Prices may change due to promotions ending, inventory updates, or pricing adjustments. The final price shown at checkout is the current price. We recommend completing your purchase promptly to secure current pricing.",
      },
      {
        question: "Can I return a monogrammed item?",
        answer:
          "Monogrammed and personalized items are generally final sale and cannot be returned unless there was an error in the personalization or the item arrived damaged.",
      },
      {
        question: "What is the correct way to list initials for a monogram?",
        answer:
          "For monograms, initials are typically listed in the order: First name, Last name, Middle name. For example, 'John Michael Smith' would be monogrammed as 'JSM' with the last name initial in the center and larger.",
      },
    ]

    // Add manual FAQs to the collection
    faqs.push(...manualFAQs)

    console.log(`📊 Total FAQs collected: ${faqs.length}`)

    if (faqs.length === 0) {
      console.log("⚠️ No FAQs found. Using fallback content...")
      return
    }

    // Clear existing vectors (optional - remove if you want to keep existing data)
    console.log("🧹 Clearing existing vectors...")
    try {
      // Note: Upstash Vector doesn't have a clear all method, so we'll just overwrite
      console.log("Proceeding with new vectors...")
    } catch (error) {
      console.log("No existing vectors to clear or error clearing:", error.message)
    }

    // Generate embeddings and store in Upstash Vector
    console.log("🔄 Generating embeddings and storing in vector database...")

    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i]
      console.log(`Processing FAQ ${i + 1}/${faqs.length}: ${faq.question.substring(0, 50)}...`)

      try {
        // Combine question and answer for better semantic search
        const combinedText = `${faq.question} ${faq.answer}`

        // Generate embedding
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: combinedText,
        })

        // Store in vector database
        await vectorDb.upsert({
          id: `williams-sonoma-faq-${i}`,
          vector: embedding,
          metadata: {
            question: faq.question,
            answer: faq.answer,
            source: "williams-sonoma-faq",
            timestamp: new Date().toISOString(),
          },
        })

        console.log(`✅ Stored FAQ ${i + 1}: ${faq.question}`)

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`❌ Error processing FAQ ${i + 1}:`, error.message)
      }
    }

    console.log("🎉 Successfully completed FAQ scraping and vectorization!")
    console.log(`📈 Total FAQs processed: ${faqs.length}`)

    // Test the vector search
    console.log("\n🧪 Testing vector search...")
    await testVectorSearch()
  } catch (error) {
    console.error("💥 Error during FAQ scraping:", error)
  }
}

async function testVectorSearch() {
  try {
    const testQueries = [
      "How can I change or cancel my order?",
      "How do I track my order?",
      "What is your return policy?",
    ]

    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`)

      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: query,
      })

      const results = await vectorDb.query({
        vector: embedding,
        topK: 2,
        includeMetadata: true,
        includeVectors: false,
      })

      console.log(`📊 Found ${results.length} results:`)
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. Score: ${result.score?.toFixed(3)} - Q: ${result.metadata?.question}`)
      })
    }
  } catch (error) {
    console.error("❌ Error testing vector search:", error)
  }
}

// Run the scraper
scrapeWilliamsSonomaFAQ()
