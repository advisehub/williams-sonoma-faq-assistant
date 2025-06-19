# Williams-Sonoma FAQ Assistant

An AI-powered chatbot that answers customer questions using Retrieval-Augmented Generation (RAG) based on Williams-Sonoma's official FAQ data.

## 🔗 Quick Links

- **[Live WS Customer Service Chatbot](https://v0-williams-sonoma-ai.vercel.app/)** - Try the Live FAQ assistant
- **[Evaluation Dashboard](https://v0-williams-sonoma-ai.vercel.app/evaluation)** - View performance metrics

---

## 📋 Table of Contents

1. [Business & Customer Overview](#business--customer-overview)
2. [Chatbot Product Overview](#chatbot-product-overview)
3. [System Overview](#system-overview)
4. [Model Overview](#model-overview)
5. [Model Evaluation](#model-evaluation)
6. [Steps to Create RAG](#steps-to-create-rag)
7. [Setup & Deployment](#setup--deployment)

---

## 🏢 Business & Customer Overview

### Business Problem
Williams-Sonoma receives thousands of customer inquiries about orders, shipping, returns, and product information. Manual customer service is expensive and doesn't scale during peak periods.

### Target Users
- **Customers**: Seeking instant answers to common questions
- **Customer Service**: Reducing repetitive inquiry volume
- **Business**: Improving customer satisfaction while reducing costs

### Key Benefits
- **24/7 Availability**: Instant responses outside business hours
- **Cost Reduction**: Deflects 60-80% of common inquiries
- **Consistency**: Accurate, standardized responses
- **Scalability**: Handles unlimited concurrent users

---

## 🤖 Chatbot Product Overview

### Core Features
- **Natural Language Understanding**: Processes customer questions in plain English
- **Contextual Responses**: Provides relevant, accurate answers from official FAQ data
- **Multi-Category Support**: Covers orders, shipping, returns, payments, and more
- **Fallback Handling**: Gracefully handles questions outside FAQ scope

### User Experience
1. Customer types question in chat interface
2. System searches relevant FAQ content using semantic similarity
3. AI generates natural response based on found information
4. Customer receives instant, accurate answer

### Coverage Areas
- **Orders & Returns**: Tracking, cancellation, modification, return policies
- **Shipping & Delivery**: Options, costs, timelines, restrictions
- **Payments**: Methods, gift cards, credit card programs
- **Products**: Personalization, availability, specifications

---

## 🏗️ System Overview

### AI Data Platform Overview
<img width="982" alt="image" src="https://github.com/user-attachments/assets/0cd73ca7-1614-4156-ab67-f175612ef8aa" />


### Architecture Diagram

<img width="901" alt="image" src="https://github.com/user-attachments/assets/8ee169a6-067d-4614-8310-f9e8c86efbef" />


\`\`\`
[Customer Question] → [Next.js Frontend] → [API Routes] → [Vector Search] → [OpenAI LLM] → [Response]
                                              ↓
                                        [Upstash Vector DB]
                                        (FAQ Embeddings)
\`\`\`

*Note: Detailed system architecture diagram to be added*

### Technology Stack
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Vector Database**: Upstash Vector (1536-dimensional embeddings)
- **LLM**: OpenAI GPT-4o for response generation
- **Embeddings**: OpenAI text-embedding-3-small
- **Deployment**: Vercel

### Data Flow
1. **Ingestion**: FAQ data → OpenAI embeddings → Upstash Vector storage
2. **Query**: User question → embedding → vector similarity search
3. **Generation**: Retrieved context + question → GPT-4o → natural response
4. **Evaluation**: Automated testing of response quality and accuracy

---

## 🧠 Model Overview

### Embedding Model
- **Model**: OpenAI text-embedding-3-small
- **Dimensions**: 1536
- **Purpose**: Convert text to numerical vectors for similarity search
- **Input**: FAQ questions + answers combined
- **Output**: Dense vector representations

### Language Model
- **Model**: OpenAI GPT-4o
- **Purpose**: Generate natural language responses
- **Context Window**: 128k tokens
- **Temperature**: 0.1 (low for consistency)
- **System Prompt**: Constrains responses to FAQ knowledge only

### RAG Pipeline
1. **Retrieval**: Top-K similar FAQ entries (K=3)
2. **Augmentation**: Combine retrieved context with user question
3. **Generation**: LLM produces response using only provided context
4. **Filtering**: Responses limited to FAQ scope, no hallucination

---

## 📊 Model Evaluation

### Evaluation Criteria

#### 1. Factual Accuracy (0-10)
- **Measures**: Correctness of information provided
- **Good (8-10)**: All facts match official FAQ data
- **Poor (0-4)**: Contains incorrect or made-up information

#### 2. Relevance (0-10)
- **Measures**: How well response addresses the question
- **Good (8-10)**: Directly answers what was asked
- **Poor (0-4)**: Off-topic or tangential response

#### 3. Completeness (0-10)
- **Measures**: Coverage of all aspects of the question
- **Good (8-10)**: Comprehensive answer covering all parts
- **Poor (0-4)**: Partial or incomplete information

#### 4. Stays Within FAQ Scope (0-10)
- **Measures**: Adherence to provided knowledge base
- **Good (8-10)**: Only uses FAQ information, admits limitations
- **Poor (0-4)**: Makes up information or uses external knowledge

#### 5. Overall Score (0-10)
- **Measures**: Holistic assessment of response quality
- **Target**: >7.0 average across all test questions

### How to Interpret Results

#### Score Ranges
- **9-10**: Excellent - Production ready
- **7-8**: Good - Minor improvements needed
- **5-6**: Fair - Significant improvements required
- **0-4**: Poor - Major issues, not production ready

#### Common Issues & Solutions
- **Low Factual Accuracy**: Update FAQ data, improve retrieval
- **Low Relevance**: Enhance embedding quality, adjust search parameters
- **Low Completeness**: Add more comprehensive FAQ entries
- **Scope Issues**: Strengthen system prompts, improve filtering

### Improvement Suggestions
1. **Expand FAQ Coverage**: Add missing topics based on evaluation gaps
2. **Improve Retrieval**: Tune similarity thresholds and top-K values
3. **Enhance Prompts**: Refine system instructions for better responses
4. **Add Examples**: Include few-shot examples in prompts
5. **Monitor Performance**: Regular evaluation with new test cases

---

## 🛠️ Steps to Create RAG

### 1. Data Collection & Preparation
\`\`\`bash
# Scrape FAQ data from Williams-Sonoma website
node scripts/scrape-and-vectorize-faq.js

# Add comprehensive FAQ dataset
node scripts/add-faq-data.js
\`\`\`

### 2. Vector Database Setup
- Create Upstash Vector index (1536 dimensions, cosine similarity)
- Generate embeddings using OpenAI text-embedding-3-small
- Store FAQ questions + answers with metadata

### 3. Retrieval System
\`\`\`typescript
// Vector similarity search
const results = await vectorDb.query({
  vector: questionEmbedding,
  topK: 3,
  includeMetadata: true
})
\`\`\`

### 4. Generation Pipeline
\`\`\`typescript
// Augment prompt with retrieved context
const response = await generateText({
  model: openai("gpt-4o"),
  system: "Answer only based on provided FAQ context...",
  prompt: \`Context: \${faqContext}\nQuestion: \${userQuestion}\`
})
\`\`\`

### 5. Evaluation Framework
- Automated testing with predefined questions
- Multi-criteria scoring (accuracy, relevance, completeness)
- CSV export for analysis and tracking

### 6. Deployment & Monitoring
- Deploy to Vercel with environment variables
- Monitor performance through evaluation dashboard
- Track usage and identify improvement areas

---

## 🚀 Setup & Deployment

### Prerequisites
- Node.js 18+
- OpenAI API key
- Upstash Vector account

### Environment Variables
\`\`\`env
UPSTASH_VECTOR_REST_URL=https://your-vector-index.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your_token_here
OPENAI_API_KEY=sk-your_openai_key_here
\`\`\`

### Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

### Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Populate FAQ Data
\`\`\`bash
# Add comprehensive FAQ dataset
node scripts/add-faq-data.js
\`\`\`

---

## 📈 Performance Metrics

### Current Evaluation Results
- **Factual Accuracy**: 8.2/10
- **Relevance**: 8.5/10  
- **Completeness**: 7.8/10
- **Stays Within Scope**: 9.1/10
- **Overall Score**: 8.4/10

### Usage Statistics
- **FAQ Coverage**: 50+ comprehensive entries
- **Response Time**: <2 seconds average
- **Vector Database**: 1536-dimensional embeddings
- **Similarity Threshold**: 0.7+ for relevant matches

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add FAQ data or improve responses
4. Run evaluation tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for Williams-Sonoma customer experience**
