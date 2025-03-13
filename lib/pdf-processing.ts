'use server';

import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFDocument } from 'pdf-lib';

// Base configuration for text splitting
const BASE_TEXT_SPLITTER_CONFIG = {
  chunkOverlap: 200,
  separators: ['\n\n', '\n', ' ', ''],
};

/**
 * Calculate optimal chunk size based on document size and content
 */
function calculateOptimalChunkSize(docs: Document[]): number {
  // Get total content length
  const totalContentLength = docs.reduce(
    (sum, doc) => sum + doc.pageContent.length,
    0
  );

  // Get number of pages
  const pageCount = docs.length;

  // Calculate average content per page
  const avgContentPerPage = pageCount > 0 ? totalContentLength / pageCount : 0;

  // For very small documents (less than 10 pages or less than 20K characters)
  if (pageCount < 10 || totalContentLength < 20000) {
    return 500; // Smaller chunks for small documents
  }

  // For medium documents (10-50 pages or 20K-100K characters)
  if (pageCount < 50 || totalContentLength < 100000) {
    return 1000; // Medium chunks
  }

  // For large documents (50-200 pages or 100K-500K characters)
  if (pageCount < 200 || totalContentLength < 500000) {
    return 1500; // Larger chunks
  }

  // For very large documents
  return 2000; // Very large chunks
}

/**
 * Enhanced PDF loader with improved error handling
 */
export async function enhancedPdfLoader(fileBlob: Blob): Promise<Document[]> {
  try {
    // Standard PDF extraction
    const loader = new PDFLoader(fileBlob);
    const docs = await loader.load();

    // Check if we got meaningful content
    const totalContent = docs.reduce(
      (sum, doc) => sum + doc.pageContent.trim().length,
      0
    );

    if (totalContent < 100 && docs.length > 0) {
      console.log(
        'Minimal content extracted from PDF. This may be a scanned document.'
      );

      // Create a placeholder document for scanned documents
      return [
        new Document({
          pageContent:
            'This appears to be a scanned document. The system was able to extract limited text content.',
          metadata: {
            source: docs[0]?.metadata?.source || 'unknown',
            isScannedDocument: true,
          },
        }),
      ];
    }

    return docs;
  } catch (error) {
    console.error('Error in PDF extraction:', error);

    // Return a fallback document
    return [
      new Document({
        pageContent:
          'Error processing PDF document. Please try again with a different file.',
        metadata: {
          source: 'error',
          error: error instanceof Error ? error.message : String(error),
        },
      }),
    ];
  }
}

/**
 * Enhanced text splitter with dynamic chunk sizing
 */
export async function enhancedTextSplitter(
  docs: Document[]
): Promise<Document[]> {
  try {
    // Calculate optimal chunk size based on document characteristics
    const optimalChunkSize = calculateOptimalChunkSize(docs);
    console.log(`Using dynamic chunk size: ${optimalChunkSize}`);

    // Create text splitter with dynamic configuration
    const splitter = new RecursiveCharacterTextSplitter({
      ...BASE_TEXT_SPLITTER_CONFIG,
      chunkSize: optimalChunkSize,
    });

    // Split the documents
    return await splitter.splitDocuments(docs);
  } catch (error) {
    console.error('Error in text splitting:', error);

    // Return the original documents if there's an error
    return docs;
  }
}

/**
 * Process a PDF with enhanced features
 */
export async function processPdfWithEnhancedFeatures(
  fileBlob: Blob
): Promise<Document[]> {
  try {
    // Load the PDF with enhanced features
    const docs = await enhancedPdfLoader(fileBlob);

    // Check if this is an error document
    if (docs.length === 1 && docs[0].metadata.source === 'error') {
      // Return the error document
      return docs;
    }

    // Process the documents with enhanced text splitting
    return await enhancedTextSplitter(docs);
  } catch (error) {
    console.error('Error in enhanced PDF processing:', error);

    // Return a fallback document
    return [
      new Document({
        pageContent:
          'Error processing PDF with enhanced features. Please try again.',
        metadata: {
          source: 'error',
          error: error instanceof Error ? error.message : String(error),
        },
      }),
    ];
  }
}
