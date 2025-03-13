import { ChatOpenAI } from '@langchain/openai';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import pineconeClient from './pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { Index, RecordMetadata } from '@pinecone-database/pinecone';
import { adminDb } from '../firebaseAdmin';
import { auth } from '@clerk/nextjs/server';
import { processPdfWithEnhancedFeatures } from './pdf-processing';

// Initialize the OpenAI model with API key and model name
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o',
});

export const indexName = 'chat-with-pdf-ai';

async function fetchMessagesFromDB(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not found');
  }

  console.log('--- Fetching chat history from the firestore database... ---');
  // Get the last 6 messages from the chat history
  const chats = await adminDb
    .collection(`users`)
    .doc(userId)
    .collection('files')
    .doc(docId)
    .collection('chat')
    .orderBy('createdAt', 'desc')
    // .limit(LIMIT)
    .get();

  const chatHistory = chats.docs.map((doc) =>
    doc.data().role === 'human'
      ? new HumanMessage(doc.data().message)
      : new AIMessage(doc.data().message)
  );

  console.log(
    `--- fetched last ${chatHistory.length} messages successfully ---`
  );
  console.log(chatHistory.map((msg) => msg.content.toString()));

  return chatHistory;
}

export async function generateDocs(docId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not found');
  }

  console.log('--- Fetching the download URL from Firebase... ---');
  const firebaseRef = await adminDb
    .collection('users')
    .doc(userId)
    .collection('files')
    .doc(docId)
    .get();

  const downloadUrl = firebaseRef.data()?.downloadUrl;

  if (!downloadUrl) {
    throw new Error('Download URL not found');
  }

  console.log(`--- Download URL fetched successfully: ${downloadUrl} ---`);

  // Fetch the PDF from the specified URL
  const response = await fetch(downloadUrl);

  // Load the PDF into a PDFDocument object
  const data = await response.blob();

  try {
    // Use enhanced PDF processing with better chunking
    console.log('--- Processing PDF with enhanced features... ---');
    const splitDocs = await processPdfWithEnhancedFeatures(data, docId);
    console.log(
      `--- Split into ${splitDocs.length} parts with enhanced processing ---`
    );
    return splitDocs;
  } catch (error) {
    console.error(
      'Enhanced PDF processing failed, falling back to standard processing:',
      error
    );

    // Fallback to standard processing if enhanced processing fails
    console.log('--- Loading PDF document with standard processing... ---');
    const loader = new PDFLoader(data);
    const docs = await loader.load();

    // Add docId to metadata for all documents
    docs.forEach((doc) => {
      doc.metadata.docId = docId;
    });

    // Split the loaded document into smaller parts for easier processing
    console.log('--- Splitting the document into smaller parts... ---');
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // Ensure docId is preserved in all split documents
    splitDocs.forEach((doc) => {
      doc.metadata.docId = docId;
    });

    console.log(
      `--- Split into ${splitDocs.length} parts with standard processing ---`
    );

    return splitDocs;
  }
}

async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string
) {
  if (!namespace) throw new Error('No namespace value provided.');

  try {
    console.log(`Checking if namespace '${namespace}' exists in Pinecone...`);

    // Method 1: Check using describeIndexStats
    const stats = await index.describeIndexStats();
    const availableNamespaces = stats.namespaces
      ? Object.keys(stats.namespaces)
      : [];
    console.log(
      `Available namespaces from stats: ${
        availableNamespaces.join(', ') || 'none'
      }`
    );

    const existsInStats = stats.namespaces?.[namespace] !== undefined;
    const recordCount = stats.namespaces?.[namespace]?.recordCount || 0;

    console.log(
      `Namespace '${namespace}' ${
        existsInStats ? `exists with ${recordCount} vectors` : 'does not exist'
      } in stats`
    );

    // Method 2: Try to query the namespace directly
    // This is more reliable as it checks if there are actual vectors in the namespace
    try {
      const queryResponse = await index.namespace(namespace).query({
        vector: Array(1536).fill(0), // Zero vector
        topK: 1,
        includeMetadata: true,
      });

      // If we get here, the namespace exists and has vectors
      const hasVectors =
        queryResponse.matches && queryResponse.matches.length > 0;
      console.log(`Namespace '${namespace}' has vectors: ${hasVectors}`);

      if (hasVectors) {
        console.log(
          `Found ${queryResponse.matches.length} vectors in namespace '${namespace}'`
        );
        // Log the first match metadata to help with debugging
        if (queryResponse.matches[0]?.metadata) {
          console.log(
            `First vector metadata:`,
            queryResponse.matches[0].metadata
          );
        }
      }

      // Return true if either method confirms the namespace exists
      return existsInStats || hasVectors;
    } catch (queryError) {
      console.log(`Query check failed: ${queryError}`);
      // If query fails, fall back to stats check
      return existsInStats;
    }
  } catch (error) {
    console.error(`Error checking if namespace exists: ${error}`);
    // Default to false on error to trigger regeneration
    return false;
  }
}

// Add a function to check if the index exists and create it if it doesn't
async function ensurePineconeIndex() {
  try {
    console.log(`Checking if Pinecone index '${indexName}' exists...`);

    // List all indexes
    const indexes = await pineconeClient.listIndexes();
    const indexExists =
      indexes.indexes?.some(
        (index: { name: string }) => index.name === indexName
      ) || false;

    if (!indexExists) {
      console.warn(
        `Pinecone index '${indexName}' does not exist. Please create it in the Pinecone console.`
      );
      console.warn(
        `Visit https://app.pinecone.io/ to create an index named '${indexName}'`
      );
      throw new Error(
        `Pinecone index '${indexName}' not found. Please create it first.`
      );
    }

    console.log(`Pinecone index '${indexName}' exists.`);
    return true;
  } catch (error) {
    console.error('Error checking Pinecone index:', error);
    throw error;
  }
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not found');
  }

  try {
    // First, ensure the Pinecone index exists
    await ensurePineconeIndex();

    let pineconeVectorStore;

    // Generate embeddings (numerical representations) for the split documents
    console.log('--- Generating embeddings... ---');
    const embeddings = new OpenAIEmbeddings();

    const index = await pineconeClient.index(indexName);
    const namespaceAlreadyExists = await namespaceExists(index, docId);

    if (namespaceAlreadyExists) {
      console.log(
        `--- Namespace ${docId} already exists, reusing existing embeddings... ---`
      );

      pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: index,
        namespace: docId,
      });

      return pineconeVectorStore;
    } else {
      // If the namespace does not exist, download the PDF from firestore via the stored Download URL & generate the embeddings and store them in the Pinecone vector store
      console.log(
        `--- Generating new embeddings for document ID: ${docId} ---`
      );
      const splitDocs = await generateDocs(docId);

      // Double-check that all documents have the docId in their metadata
      splitDocs.forEach((doc) => {
        if (!doc.metadata.docId) {
          doc.metadata.docId = docId;
        }
      });

      console.log(
        `--- Storing the embeddings in namespace ${docId} in the ${indexName} Pinecone vector store... ---`
      );

      pineconeVectorStore = await PineconeStore.fromDocuments(
        splitDocs,
        embeddings,
        {
          pineconeIndex: index,
          namespace: docId,
        }
      );

      return pineconeVectorStore;
    }
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error(
      `Failed to generate embeddings: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

const generateLangchainCompletion = async (docId: string, question: string) => {
  try {
    let pineconeVectorStore;

    try {
      console.log(`Starting chat completion for document: ${docId}`);

      // First, ensure the Pinecone index exists
      await ensurePineconeIndex();

      // Create embeddings instance
      const embeddings = new OpenAIEmbeddings();

      // Get the Pinecone index
      const index = await pineconeClient.index(indexName);

      // Check if namespace already exists - using the same check as in generateEmbeddingsInPineconeVectorStore
      const namespaceAlreadyExists = await namespaceExists(index, docId);

      if (namespaceAlreadyExists) {
        console.log(
          `--- Using existing embeddings from namespace ${docId} ---`
        );

        // Use existing embeddings
        pineconeVectorStore = await PineconeStore.fromExistingIndex(
          embeddings,
          {
            pineconeIndex: index,
            namespace: docId,
          }
        );
      } else {
        console.log(
          `--- Embeddings not found for ${docId}, generating new embeddings... ---`
        );

        // If embeddings don't exist, generate them using the same function as during upload
        pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(
          docId
        );
      }
    } catch (error) {
      console.error('Error with Pinecone vector store:', error);
      return `Error: Unable to access the document's AI embeddings. ${
        error instanceof Error
          ? error.message
          : 'Please try again later or contact support.'
      }`;
    }

    if (!pineconeVectorStore) {
      throw new Error('Pinecone vector store not found');
    }

    // Create a retriever to search through the vector store
    console.log('--- Creating a retriever... ---');
    const retriever = pineconeVectorStore.asRetriever();

    // Fetch the chat history from the database
    const chatHistory = await fetchMessagesFromDB(docId);

    // Define a prompt template for generating search queries based on conversation history
    console.log('--- Defining a prompt template... ---');
    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
      ...chatHistory, // Insert the actual chat history here

      ['user', '{input}'],
      [
        'user',
        'Given the above conversation, generate a search query to look up in order to get information relevant to the conversation',
      ],
    ]);

    // Create a history-aware retriever chain that uses the model, retriever, and prompt
    console.log('--- Creating a history-aware retriever chain... ---');
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
      llm: model,
      retriever,
      rephrasePrompt: historyAwarePrompt,
    });

    // Define a prompt template for answering questions based on retrieved context
    console.log(
      '--- Defining a prompt template for answering questions... ---'
    );
    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        "Answer the user's questions based on the below context:\n\n{context}",
      ],

      ...chatHistory, // Insert the actual chat history here

      ['user', '{input}'],
    ]);

    // Create a chain to combine the retrieved documents into a coherent response
    console.log('--- Creating a document combining chain... ---');
    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
      llm: model,
      prompt: historyAwareRetrievalPrompt,
    });

    // Create the main retrieval chain that combines the history-aware retriever and document combining chains
    console.log('--- Creating the main retrieval chain... ---');
    const conversationalRetrievalChain = await createRetrievalChain({
      retriever: historyAwareRetrieverChain,
      combineDocsChain: historyAwareCombineDocsChain,
    });

    console.log('--- Running the chain with a sample conversation... ---');
    const reply = await conversationalRetrievalChain.invoke({
      chat_history: chatHistory,
      input: question,
    });

    // Print the result to the console
    console.log(reply.answer);
    return reply.answer;
  } catch (error) {
    console.error('Error in generateLangchainCompletion:', error);
    return `Sorry, I encountered an error while processing your question. ${
      error instanceof Error ? error.message : 'Please try again later.'
    }`;
  }
};

// Export the model and the run function
export { model, generateLangchainCompletion };
