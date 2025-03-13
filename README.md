# Chat with PDF AI

An intelligent document assistant that transforms static PDFs into interactive conversations. Upload your documents and chat with them using natural language to quickly extract insights, find information, and understand complex content.

![App Screenshot](https://i.imgur.com/R7m4Oty.png)

**Plug:** **Lorem Word Doc** was generated with [Lorem Generator](https://github.com/darrylwongqz/lorem-generator)

## 🌟 Features

- **PDF Upload & Management**: Securely upload and manage your PDF documents in the cloud
- **AI-Powered Chat**: Ask questions about your documents in natural language and get accurate answers
- **Interactive PDF Viewer**: View PDFs with zoom, rotation, and navigation controls
- **Vector Embeddings**: Advanced document indexing using Pinecone for semantic search capabilities
- **Chat History**: Persistent conversation history for each document
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **User Authentication**: Secure user accounts and document access
- **Subscription Tiers**: Free and premium subscription options with different document limits

## 🔗 Live Demo

Experience the application live: [Chat with PDF AI](https://chat-with-pdf-ai-three.vercel.app/)

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router for server components and routing
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn UI**: Reusable UI components built with Radix UI and Tailwind
- **React PDF**: PDF rendering and interaction

### Backend & Services
- **Firebase**: 
  - Firestore for document and chat storage
  - Firebase Storage for PDF file storage
  - Firebase Admin SDK for server-side operations
- **Clerk**: User authentication and management
- **Stripe**: Payment processing for premium subscriptions
- **Pinecone**: Vector database for document embeddings
- **OpenAI**: GPT models for natural language understanding and generation

### AI/ML
- **LangChain**: Framework for building LLM-powered applications
- **OpenAI Embeddings**: For converting document text into vector representations

## 🔍 Enhanced PDF Processing Pipeline

The application features a sophisticated PDF processing pipeline designed to optimize document understanding and retrieval. This system transforms raw PDFs into AI-ready content through several key stages:

### 1. Robust Text Extraction

- **Advanced PDF Parsing**: Uses PDFLoader from LangChain to extract text content while preserving structure
- **Error Detection**: Automatically identifies when minimal text is extracted (< 100 characters) and flags potential scanned documents
- **Graceful Fallbacks**: Provides informative messages when documents can't be fully processed
- **Metadata Preservation**: Maintains document metadata throughout the processing pipeline

### 2. Dynamic Chunk Sizing

- **Content-Aware Processing**: Analyzes document characteristics to determine optimal chunk sizes
- **Adaptive Algorithm**: Automatically adjusts chunk size based on:
  - Total document length (character count)
  - Number of pages
  - Content density
- **Size Tiers**:
  - Small documents (< 10 pages or < 20K chars): 500 character chunks
  - Medium documents (10-50 pages or 20K-100K chars): 1000 character chunks
  - Large documents (50-200 pages or 100K-500K chars): 1500 character chunks
  - Very large documents (> 200 pages or > 500K chars): 2000 character chunks
- **Performance Optimization**: Balances chunk granularity with processing efficiency

### 3. Intelligent Text Splitting

- **Context Preservation**: Uses 200-character overlaps between chunks to maintain context across boundaries
- **Hierarchical Separators**: Prioritizes natural document breaks (paragraphs, sentences, words)
- **RecursiveCharacterTextSplitter**: Leverages LangChain's advanced text splitting for optimal segmentation

### 4. Vector Embedding Generation

- **OpenAI Embeddings**: Converts text chunks into high-dimensional vector representations
- **Semantic Understanding**: Captures meaning and context, not just keywords
- **Efficient Storage**: Organizes embeddings in Pinecone vector database for fast retrieval
- **Namespace Isolation**: Maintains separate vector spaces for each document

### 5. Retrieval-Augmented Generation

- **Semantic Search**: Finds the most relevant document chunks based on query similarity
- **History-Aware Retrieval**: Considers conversation context when retrieving information
- **Contextual Responses**: Generates answers based on retrieved document content
- **Source Attribution**: Maintains connection to source material for verification

### Technical Implementation

The PDF processing pipeline is implemented in `lib/pdf-processing.ts` with these key components:

```typescript
// Core extraction function with error handling
export async function enhancedPdfLoader(fileBlob: Blob): Promise<Document[]>

// Dynamic chunk sizing based on document characteristics
function calculateOptimalChunkSize(docs: Document[]): number

// Intelligent text splitting with optimal chunking
export async function enhancedTextSplitter(docs: Document[]): Promise<Document[]>

// Main processing pipeline combining all steps
export async function processPdfWithEnhancedFeatures(fileBlob: Blob): Promise<Document[]>
```

This pipeline ensures that documents of any size or complexity are processed optimally for AI interaction, providing users with accurate and contextually relevant responses to their queries.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase account
- Clerk account
- Pinecone account
- OpenAI API key
- Stripe account (for payment processing)

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# OpenAI
OPENAI_API_KEY=

# Pinecone
PINECONE_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
PRO_TIER_PRICE_ID=
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chat-with-pdf-ai.git
   cd chat-with-pdf-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

1. Create a production build:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   npm start
   # or
   yarn start
   ```

## 📝 Additional Setup

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore and Storage
3. Set up authentication with Clerk
4. Generate a service account key for Firebase Admin SDK
5. Configure CORS for Firebase Storage using the provided cors.json file

### Pinecone Setup
1. Create a Pinecone account and create an index named "chat-with-pdf-ai"
2. Set dimensions to 1536 for OpenAI embeddings
3. Use cosine similarity as the metric

### Stripe Setup
1. Create products and price IDs in the Stripe dashboard
2. Set up webhook endpoints for subscription management

## 💳 Testing Pro Account

To test the Pro account upgrade functionality without using a real credit card:

1. Navigate to the upgrade page in the application
2. Click on the "Upgrade to Pro" button
3. Use the following test credit card details provided by Stripe:
   - Card Number: `4242 4242 4242 4242`
   - Expiration Date: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - Name and Address: Any values

This will simulate a successful payment and upgrade your account to Pro status in the test environment. The test card will not incur any actual charges.

Note: For testing other scenarios (like declined payments), you can use different [test card numbers provided by Stripe](https://stripe.com/docs/testing#cards).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [OpenAI](https://openai.com/) for providing the AI models
- [Vercel](https://vercel.com/) for hosting and deployment
- [Firebase](https://firebase.google.com/) for backend services
- All open-source libraries and their contributors
