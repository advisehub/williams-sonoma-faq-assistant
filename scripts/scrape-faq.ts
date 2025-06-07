import fetch from "node-fetch"
import { JSDOM } from "jsdom"
import { UpstashVector } from "@upstash/vector"
import { embed } from "ai"
import { openai } from "@ai-sdk/openai"
import dotenv from "dotenv"

dotenv.config()

// Initialize Upstash Vector client
const vectorDb = new UpstashVector({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
})

async function scrapeFAQs() {
  console.log("Starting to scrape Williams-Sonoma FAQ...")

  try {
    // Fetch the FAQ page
    const response = await fetch("https://www.williams-sonoma.com/customer-service/faq.html")
    const html = await response.text()

    // Parse the HTML
    const dom = new JSDOM(html)
    const document = dom.window.document

    // Extract FAQ sections
    const faqSections = document.querySelectorAll(".customer-service-faq")
    const faqs = []

    // Process each FAQ section
    faqSections.forEach((section) => {
      const questions = section.querySelectorAll(".faq-question")
      const answers = section.querySelectorAll(".faq-answer")

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i].textContent.trim()
        const answer = answers[i] ? answers[i].textContent.trim() : ""

        if (question && answer) {
          faqs.push({ question, answer })
        }
      }
    })

    console.log(`Extracted ${faqs.length} FAQs`)

    // Store FAQs in Upstash Vector
    console.log("Generating embeddings and storing in Upstash Vector...")

    for (const faq of faqs) {
      const combinedText = `${faq.question} ${faq.answer}`

      // Generate embedding
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: combinedText,
      })

      // Store in vector database
      await vectorDb.upsert({
        id: `faq-${faqs.indexOf(faq)}`,
        vector: embedding,
        metadata: {
          question: faq.question,
          answer: faq.answer,
        },
      })
    }

    console.log("Successfully stored FAQs in Upstash Vector")
  } catch (error) {
    console.error("Error scraping FAQs:", error)
  }
}

// Run the scraper
scrapeFAQs()
