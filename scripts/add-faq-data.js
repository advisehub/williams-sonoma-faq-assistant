import { UpstashVector } from "@upstash/vector"
import { embed } from "ai"
import { openai } from "@ai-sdk/openai"

// Initialize Upstash Vector client
const vectorDb = new UpstashVector({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
})

// Comprehensive FAQ data from the provided text
const newFAQData = [
  // Ordering - Orders & Returns
  {
    question: "How do I track my order?",
    answer: "You can track your order 24 hours after it is placed.",
    category: "Orders & Returns",
  },
  {
    question: "Can I return or exchange an item?",
    answer:
      "Eligible items can be returned for a refund of the merchandise value within 30 days of receiving an order or 7 days for Quick Ship upholstery items. An original receipt or gift receipt is required. Return by UPS - print a return label from our Returns Policy page and bring to a UPS location. For non-custom furniture and other oversized items, call Customer Service at 1.877.812.6235. Return to Stores - You can return most non-furniture items to your local Williams Sonoma location (Williams Sonoma and Williams Sonoma Home outlet stores excluded). Items Not Eligible for Returns: Items without an original receipt or gift receipt, Monogrammed/Personalized items, Made to Order items including custom rugs and furniture, Mattresses, Gift Cards, Perishables, Final sale items (with prices ending in $.X7 or $.X9), Items damaged through normal wear and tear.",
    category: "Orders & Returns",
  },
  {
    question: "How can I change or cancel my order?",
    answer:
      "To change or cancel your order, contact Customer Service at 1.877.812.6235. Front Door deliveries cannot be canceled as they are processed immediately to ensure quick arrival. We cannot accept changes or cancellations on some items, view our Return Policy.",
    category: "Orders & Returns",
  },
  {
    question: "Can I ship items to multiple addresses?",
    answer: "When you checkout, you will be given the option on the shipping page to 'Ship to multiple addresses.'",
    category: "Orders & Returns",
  },
  {
    question: "Why is the price for an item different from when I added it to the shopping cart?",
    answer:
      "Prices are subject to change — including temporary reductions as well as permanent increases. The prices of items in your cart represent the current price for which you will be charged.",
    category: "Orders & Returns",
  },

  // Personalized Items
  {
    question: "Can I return a monogrammed item?",
    answer:
      "Unfortunately, we do not offer returns on personalized products. Verify your monogram or personalization is correct before purchasing.",
    category: "Personalized Items",
  },
  {
    question: "What is the correct way to list initials for a monogram?",
    answer:
      "When selecting a style for your monogram, the order of initials varies according to the style. When the center letter is taller than the others, the order of the initials is traditionally first/last/middle. For example, say your name is Laura Marie Clark, the monogram would be LCM. For styles in which all letters are equal in size, the order of the initials should be first/middle/last. In this case, the monogram would be LMC.",
    category: "Personalized Items",
  },

  // Shipping and Delivery
  {
    question: "What shipping options are available?",
    answer:
      "Our products are delivered in two ways, either: Front Door Parcel Delivery (e.g., UPS, USPS) to your delivery address, or Truck Delivery for most furniture and other items that exceed parcel carrier shipping weight limits; usually includes our Premium White Glove and Unlimited Items for a Flat Rate fee. Doorstep delivery may be available at a reduced Flat Rate; does not include assembly and you are responsible for bringing the items into your home.",
    category: "Shipping and Delivery",
  },
  {
    question: "What does 'Unlimited Flat Rate' mean?",
    answer:
      "Unlimited Flat Rate is the fee structure applied to our Truck Delivery for most orders. Items eligible for Unlimited Flat Rate Delivery will be indicated on the product page. With Unlimited Flat Rate Shipping, an unlimited number of eligible furniture and select non-furniture items can be delivered for a single flat rate, per shipping address. Your order will ship when all items in your order are available for delivery. Truck Delivery usually includes our Premium White Glove service - items are delivered to your home by appointment to your room of choice — and are then unpacked and fully assembled (installation is not included).",
    category: "Shipping and Delivery",
  },
  {
    question: "How do you deliver furniture?",
    answer:
      "Most furniture is delivered by truck delivery with our White Glove service: items are delivered to your home by appointment to your room of choice and they are unpacked and fully assembled. Some smaller furniture pieces can be delivered by parcel carrier which does not include White Glove service (check the product page for details). For Beds, we're happy to place headboards, in their original packaging, in any room you desire, but we're not able to unpack, inspect or attach them to existing bed frames.",
    category: "Shipping and Delivery",
  },
  {
    question: "What does 'Quick Ship' mean?",
    answer:
      "If an upholstered item is marked as 'Quick Ship' it means that it is stocked at one of our warehouses, and is available to be delivered within 2 to 4 weeks. There is no additional charge for Quick Ship items. Note that Quick Ship status is subject to product availability at time of shipping.",
    category: "Shipping and Delivery",
  },
  {
    question: "How do you calculate shipping and processing charges?",
    answer:
      "For Front Door Shipping, shipping and processing charges are based on the merchandise total for each delivery address. If available, next day delivery incurs an additional charge. For Truck Delivery, unlimited flat rate shipping and processing charges are based on the distance from our warehouse to the shipping address, as well as order total.",
    category: "Shipping and Delivery",
  },
  {
    question: "What is a Delivery Surcharge?",
    answer:
      "Items that are bulky, heavy, or of limited availability may have a delivery surcharge in addition to standard delivery and processing charges. This charge is shown on the product page by the item price and is in addition to regular delivery and processing charges.",
    category: "Shipping and Delivery",
  },
  {
    question: "Can I send a gift message on each package?",
    answer: "We can only offer one customized gift message per shipping address.",
    category: "Shipping and Delivery",
  },
  {
    question: "Can I delay the shipment of my order?",
    answer:
      "If you wish to place an order but delay its shipment to a later date, please do so through our Customer Service Center. Call 1.877.812.6235, and one of our sales associates will be happy to assist you.",
    category: "Shipping and Delivery",
  },
  {
    question: "Why is an item unavailable in my ZIP code?",
    answer:
      "In some cases, items featured on our website are unavailable in certain areas. This may be due to regional availability of inventory, local restrictions on certain product types, weather conditions and other factors. We encourage you to check out similar products on our site that meet your needs and are available to ship or pick up in a nearby store.",
    category: "Shipping and Delivery",
  },

  // Shipping Destinations
  {
    question: "Can I ship to a P.O. Box?",
    answer:
      "Yes, for an additional charge of $10. When entering an APO or FPO address, please follow this example: Name: PO3 Chuck Williams, Address Line: Marine Division Sct 1, Address Line: USS Wisconsin BB–64, ZIP Code: 12345 (use actual zip code), City: FPO (use 'APO' if appropriate), State: AA or AE",
    category: "Shipping and Delivery",
  },
  {
    question: "Can I ship to Canadian addresses?",
    answer: "Yes! Visit our stores or shop now at www.williams-sonoma.ca.",
    category: "Shipping and Delivery",
  },

  // Gifts and Gift Cards
  {
    question: "Why can't I gift wrap an item?",
    answer:
      "Some larger items, and items sent directly from our vendors, cannot be gift wrapped. Gift messages can be included on the packing slip of any order at no extra charge.",
    category: "Gifts and Gift Cards",
  },
  {
    question: "How do I purchase Gift Cards online?",
    answer: "We offer gift cards and e-gift cards. Visit the Gift Cards page.",
    category: "Gifts and Gift Cards",
  },
  {
    question: "How do I check my balance or redeem a gift card, e-gift card or merchandise credit online?",
    answer:
      "To redeem, enter the 16-digit Gift Card number and the 8-digit PIN (both numbers can be found on the back of the card) at checkout, and the Gift Card value will be deducted automatically from your total.",
    category: "Gifts and Gift Cards",
  },
  {
    question: "Am I able to return the e-gift card?",
    answer:
      "You may not return or cancel your Williams Sonoma e-gift card after it is received. Purchasers who wish to cancel an e-gift card purchase prior to its delivery to a recipient should contact CashStar Customer Support prior to the delivery date selected at the time of your purchase. If you return merchandise originally purchased with an e-gift card, any refund will be issued in the form of a merchandise credit that may be used online, in stores or by phone.",
    category: "Gifts and Gift Cards",
  },
  {
    question: "What if I lose my gift card, e-gift card or merchandise credit?",
    answer:
      "Please think of gift cards, e-gift cards and merchandise credit cards like cash. Also, please protect the cards from magnets and other potentially damaging items, as you would a bank credit card; if the magnetic strip is damaged, the value could be lost. If your e-gift card was lost or stolen, contact CashStar Customer Support immediately.",
    category: "Gifts and Gift Cards",
  },
  {
    question: "What is Group Gifting?",
    answer:
      "Group gifting is just like 'chipping in' - sharing the cost of a gift with friends or family instead of paying for the entire gift yourself. Collected contributions are pooled together and the gift recipient receives an e-gift card for the total value of all contributions.",
    category: "Gifts and Gift Cards",
  },

  // Credit Card
  {
    question: "What is the Williams Sonoma Key Rewards Credit Card?",
    answer:
      "The Williams Sonoma Credit Card can be used to make purchases at any Williams Sonoma store, through our catalog or website.",
    category: "Credit Card",
  },
  {
    question: "What is The Key Rewards?",
    answer:
      "The Key Rewards is a rich program that lets members earn and redeem rewards on eligible purchases across our collection of eight brands. There are two ways to join: Apply to be a Cardmember and earn 5% back in Gold rewards with a Key Rewards Credit Card. Or, join as a Member for free and use your registered phone number at checkout to earn 2% back in Silver rewards.",
    category: "Credit Card",
  },
  {
    question: "What are the benefits of the Williams Sonoma Key Rewards Credit Card?",
    answer:
      "Cardmembers can earn 5% back in rewards on eligible purchases online or in-store across our eight brands or opt for 12-month promotional financing on purchases of $750 or more. Plus, Visa Cardmembers can also use their card anywhere Visa is accepted and earn 4% back in rewards at restaurants (excludes fast food) and grocery stores and 1% back on everything else.",
    category: "Credit Card",
  },

  // Business Sales
  {
    question: "What services do you offer for business or interior designers?",
    answer:
      "We provide dedicated sales and services to interior designers, home developers, hotel, and business gift buyers.",
    category: "Business Sales",
  },
  {
    question: "Can I get assistance for my company with gift-giving and large orders?",
    answer:
      "Yes, our business-gift and incentives programs are designed to meet your needs year-round. Please call 1.800.838.2589 to speak with a sales associate or email us at businessgifts@williams-sonoma.com if you would like more information.",
    category: "Business Sales",
  },
  {
    question: "Can I customize an item with a company logo?",
    answer:
      "Yes, many of our items can be customized with a company logo or employee monograms. Call 1.800.838.2589 or email us at businessgifts@williams-sonoma.com and we'll be happy to assist you.",
    category: "Business Sales",
  },
  {
    question: "Can I buy gift cards in bulk?",
    answer:
      "Absolutely. For complete details, or to purchase gift cards in amounts over $5,000, call 1.800.838.2589 or email us at incentives@williams-sonoma.com.",
    category: "Business Sales",
  },

  // Online Security
  {
    question: "When I submit credit card information online, is it secure?",
    answer:
      "Williams Sonoma has sophisticated encryption and authentication tools to protect the security of your credit card information, and we will do our best to protect its security on our systems. Specifically, every page in the williams-sonoma.com ordering process that requests credit card information uses Secure Socket Layer (SSL) encryption, which is designed to render information unreadable should anyone try to intercept it.",
    category: "Online Security",
  },
  {
    question: "Will Williams Sonoma sell or rent my information to other companies?",
    answer:
      "We'll communicate with you only if you want to hear from us. If you prefer not to receive information from us or from our select partners, please let us know by calling our Customer Service department at 1.877.812.6235.",
    category: "Online Security",
  },

  // Payment Methods
  {
    question: "What Payment Methods are Available?",
    answer:
      "You can choose to pay with a Credit Card (Visa, MasterCard, American Express or Discover), PayPal, Apple Pay, Venmo, Affirm, Williams Sonoma Credit Card, Williams Sonoma Visa Card or any Williams Sonoma Brand Gift Card.",
    category: "Payment Methods",
  },
]

// Function to normalize text for comparison
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Function to calculate similarity between two texts
function calculateSimilarity(text1, text2) {
  const normalized1 = normalizeText(text1)
  const normalized2 = normalizeText(text2)

  // Simple word-based similarity
  const words1 = normalized1.split(" ")
  const words2 = normalized2.split(" ")

  const intersection = words1.filter((word) => words2.includes(word))
  const union = [...new Set([...words1, ...words2])]

  return intersection.length / union.length
}

// Function to check for duplicates
async function findDuplicates(newFAQ, existingVectors) {
  const duplicates = []

  for (const existing of existingVectors) {
    if (!existing.metadata?.question) continue

    const questionSimilarity = calculateSimilarity(newFAQ.question, existing.metadata.question)

    // Consider it a duplicate if questions are very similar (>80% similarity)
    if (questionSimilarity > 0.8) {
      duplicates.push({
        existingId: existing.id,
        existingQuestion: existing.metadata.question,
        similarity: questionSimilarity,
      })
    }
  }

  return duplicates
}

// Function to get all existing vectors
async function getAllExistingVectors() {
  try {
    // Get database info first
    const info = await vectorDb.info()
    console.log(`📊 Database has ${info.vectorCount || 0} vectors`)

    if (!info.vectorCount || info.vectorCount === 0) {
      return []
    }

    // Query with a dummy vector to get existing data
    const dummyVector = new Array(info.dimension || 1536).fill(0.1)
    const results = await vectorDb.query({
      vector: dummyVector,
      topK: Math.min(info.vectorCount, 1000), // Get up to 1000 vectors
      includeMetadata: true,
      includeVectors: false,
    })

    return results
  } catch (error) {
    console.error("Error getting existing vectors:", error)
    return []
  }
}

async function addFAQData() {
  console.log("🚀 Starting to add comprehensive FAQ data to vector database...")

  try {
    // Get existing vectors to check for duplicates
    console.log("📥 Fetching existing vectors for duplicate detection...")
    const existingVectors = await getAllExistingVectors()
    console.log(`📊 Found ${existingVectors.length} existing vectors`)

    let addedCount = 0
    let duplicateCount = 0
    let errorCount = 0

    for (let i = 0; i < newFAQData.length; i++) {
      const faq = newFAQData[i]
      console.log(`\n📝 Processing FAQ ${i + 1}/${newFAQData.length}: ${faq.question.substring(0, 50)}...`)

      try {
        // Check for duplicates
        const duplicates = await findDuplicates(faq, existingVectors)

        if (duplicates.length > 0) {
          console.log(`⚠️  Found ${duplicates.length} potential duplicate(s):`)
          duplicates.forEach((dup) => {
            console.log(`   - "${dup.existingQuestion}" (${(dup.similarity * 100).toFixed(1)}% similar)`)
          })

          // Skip if very high similarity
          if (duplicates.some((dup) => dup.similarity > 0.9)) {
            console.log(`⏭️  Skipping due to high similarity`)
            duplicateCount++
            continue
          }
        }

        // Generate embedding
        const combinedText = `${faq.question} ${faq.answer}`
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: combinedText,
        })

        // Store in vector database
        const vectorId = `williams-sonoma-faq-comprehensive-${i}`
        await vectorDb.upsert({
          id: vectorId,
          vector: embedding,
          metadata: {
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            source: "williams-sonoma-faq-comprehensive",
            timestamp: new Date().toISOString(),
          },
        })

        console.log(`✅ Added: ${faq.question}`)
        addedCount++

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`❌ Error processing FAQ ${i + 1}:`, error.message)
        errorCount++
      }
    }

    console.log("\n🎉 FAQ data processing completed!")
    console.log(`📈 Summary:`)
    console.log(`   ✅ Added: ${addedCount} new FAQs`)
    console.log(`   ⚠️  Skipped duplicates: ${duplicateCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📊 Total processed: ${newFAQData.length}`)

    // Test the updated database
    console.log("\n🧪 Testing updated database...")
    await testUpdatedDatabase()
  } catch (error) {
    console.error("💥 Error during FAQ data addition:", error)
  }
}

async function testUpdatedDatabase() {
  try {
    const testQueries = [
      "How can I change or cancel my order?",
      "What are the return policies?",
      "What shipping options do you have?",
      "How do gift cards work?",
      "What is the credit card program?",
    ]

    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`)

      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: query,
      })

      const results = await vectorDb.query({
        vector: embedding,
        topK: 3,
        includeMetadata: true,
        includeVectors: false,
      })

      console.log(`📊 Found ${results.length} results:`)
      results.forEach((result, index) => {
        console.log(
          `  ${index + 1}. Score: ${result.score?.toFixed(3)} - Q: ${result.metadata?.question?.substring(0, 60)}...`,
        )
      })
    }
  } catch (error) {
    console.error("❌ Error testing database:", error)
  }
}

// Run the script
addFAQData()
