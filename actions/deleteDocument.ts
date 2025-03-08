'use server';

import { adminDb, adminStorage } from '@/firebaseAdmin';
import { indexName } from '@/lib/langchain';
import pineconeClient from '@/lib/pinecone';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

type DeleteResult = {
  success: boolean;
  message: string;
};

/**
 * Deletes a document and all associated data (storage file and vector embeddings)
 * @param docId The ID of the document to delete
 * @returns Object with success status and message
 */
export async function deleteDocument(docId: string): Promise<DeleteResult> {
  try {
    // Verify authentication
    auth().protect();
    const { userId } = await auth();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (!docId) {
      throw new Error('Document ID is required');
    }

    // Run all deletion operations in parallel for better performance
    await Promise.all([
      // 1. Delete document metadata from Firestore
      deleteFromFirestore(userId, docId),

      // 2. Delete PDF file from Firebase Storage
      deleteFromStorage(userId, docId),

      // 3. Delete vector embeddings from Pinecone
      deleteFromPinecone(docId),
    ]);

    // Revalidate the dashboard page to ensure the documents are up to date
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Document successfully deleted',
    };
  } catch (error) {
    console.error(`Error deleting document ${docId}:`, error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to delete document',
    };
  }
}

/**
 * Deletes document metadata from Firestore
 */
async function deleteFromFirestore(
  userId: string,
  docId: string
): Promise<void> {
  try {
    await adminDb
      .collection('users')
      .doc(userId)
      .collection('files')
      .doc(docId)
      .delete();
  } catch (error) {
    console.error(`Error deleting from Firestore:`, error);
    throw new Error(
      `Failed to delete document metadata: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Deletes PDF file from Firebase Storage
 */
async function deleteFromStorage(userId: string, docId: string): Promise<void> {
  try {
    const bucket = process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucket) {
      throw new Error('Firebase storage bucket not configured');
    }

    const filePath = `users/${userId}/files/${docId}`;
    await adminStorage.bucket(bucket).file(filePath).delete();
  } catch (error) {
    console.error(`Error deleting from Storage:`, error);
    throw new Error(
      `Failed to delete file from storage: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Deletes vector embeddings from Pinecone
 */
async function deleteFromPinecone(docId: string): Promise<void> {
  try {
    const index = await pineconeClient.index(indexName);
    await index.namespace(docId).deleteAll();
  } catch (error) {
    console.error(`Error deleting from Pinecone:`, error);
    throw new Error(
      `Failed to delete vector embeddings: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
