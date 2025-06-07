export const runtime = "nodejs"

// Mock FAQ data for demonstration
const mockFAQs = [
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
]

function findRelevantMockFAQs(query: string) {
  const queryLower = query.toLowerCase()
  return mockFAQs
    .filter(
      (faq) =>
        faq.question.toLowerCase().includes(queryLower) ||
        faq.answer.toLowerCase().includes(queryLower) ||
        queryLower.includes(faq.question.toLowerCase().split(" ").slice(0, 3).join(" ")),
    )
    .slice(0, 3)
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1].content

    // Find relevant mock FAQs
    const relevantFAQs = findRelevantMockFAQs(lastMessage)

    // Create context from the relevant FAQs
    const faqContext =
      relevantFAQs.length > 0
        ? relevantFAQs.map((faq) => `Question: ${faq.question}\nAnswer: ${faq.answer}`).join("\n\n")
        : "No relevant FAQ information found."

    // For now, return a simple response based on mock data
    let response = ""

    if (relevantFAQs.length > 0) {
      // If we have a direct match for "How can I change or cancel my order?"
      if (lastMessage.toLowerCase().includes("change") && lastMessage.toLowerCase().includes("cancel")) {
        response = mockFAQs[0].answer
      } else {
        response = relevantFAQs[0].answer
      }
    } else {
      response =
        "I don't have that specific information in the Williams-Sonoma FAQ. You may want to contact customer service directly at 1-877-812-6235 for more details."
    }

    return Response.json({
      text: response,
      success: true,
    })
  } catch (error) {
    console.error("Error in chat route:", error)
    return Response.json(
      {
        text: "I'm sorry, I encountered an error. Please try again or contact customer service at 1-877-812-6235.",
        success: false,
        error: "Failed to process your request",
      },
      { status: 500 },
    )
  }
}
