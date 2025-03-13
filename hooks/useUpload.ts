'use client';

import { generateEmbeddings } from '@/actions/generateEmbeddings';
import { db, storage } from '@/firebase';
import { useUser } from '@clerk/nextjs';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  UploadTask,
} from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

export enum StatusText {
  UPLOADING = 'Uploading file...',
  UPLOADED = 'File uploaded successfully',
  SAVING = 'Saving file to database...',
  GENERATING = 'Generating AI Embeddings, This will only take a few seconds...',
}

// Define Status as the enum values
export type Status = StatusText;

interface UseUploadReturn {
  progress: number | null;
  fileId: string | null;
  status: Status | null;
  handleUpload: (file: File) => Promise<void>;
}

function useUpload(): UseUploadReturn {
  const [progress, setProgress] = useState<number | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleUpload = async (file: File): Promise<void> => {
    if (!file || !user) return;

    const fileIdToUploadTo = uuidv4(); // example: 123e4567-e89b-12d3-a456-426614174000

    const storageRef = ref(
      storage,
      `users/${user.id}/files/${fileIdToUploadTo}`
    );

    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setStatus(StatusText.UPLOADING);
        setProgress(percent);
      },
      (error) => {
        console.error('Error uploading file', error);
        toast({
          variant: 'destructive',
          title: 'Upload Error',
          description: `Failed to upload file: ${error.message}`,
        });
      },
      async () => {
        setStatus(StatusText.UPLOADED);

        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

        setStatus(StatusText.SAVING);
        await setDoc(doc(db, 'users', user.id, 'files', fileIdToUploadTo), {
          name: file.name,
          size: file.size,
          type: file.type,
          downloadUrl: downloadUrl,
          ref: uploadTask.snapshot.ref.fullPath,
          createdAt: serverTimestamp(),
        });

        // Process with enhanced PDF parsing
        setStatus(StatusText.GENERATING);
        try {
          await generateEmbeddings(fileIdToUploadTo);
          setFileId(fileIdToUploadTo);
        } catch (error) {
          console.error('Error processing document:', error);
          toast({
            variant: 'destructive',
            title: 'Processing Error',
            description: `Failed to process document: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          });
        }
      }
    );
  };

  return {
    progress,
    fileId,
    status,
    handleUpload,
  };
}

export default useUpload;
