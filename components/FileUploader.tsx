'use client';

import { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CheckCircleIcon,
  CircleArrowDown,
  HammerIcon,
  RocketIcon,
  SaveIcon,
} from 'lucide-react';
import useUpload, { StatusText } from '@/hooks/useUpload';
import { useRouter } from 'next/navigation';
import useSubscription from '@/hooks/useSubscription';
import { useToast } from './ui/use-toast';
import { CSSProperties } from 'react';

// Define a custom type for the CSS properties with CSS variables
interface RadialProgressStyle extends CSSProperties {
  '--value': string;
  '--size': string;
  '--thickness': string;
}

function FileUploader() {
  const { progress, status, fileId, handleUpload } = useUpload();
  const { isOverFileLimit, filesLoading } = useSubscription();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (fileId) {
      router.push(`/dashboard/files/${fileId}`);
    }
  }, [fileId, router]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Invalid File',
          description: 'Please upload a valid PDF document.',
        });
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        if (!isOverFileLimit && !filesLoading) {
          await handleUpload(file);
        } else {
          toast({
            variant: 'destructive',
            title: 'Free Plan File Limit Reached',
            description:
              'You have reached the maximum number of files allowed for your account. Please upgrade to add more documents.',
          });
        }
      }
    },
    [handleUpload, isOverFileLimit, filesLoading, toast]
  );

  // Create a mapping from status text to icons
  const statusIcons: Record<StatusText, JSX.Element> = {
    [StatusText.UPLOADING]: (
      <RocketIcon className="h-20 w-20 text-indigo-600" />
    ),
    [StatusText.UPLOADED]: (
      <CheckCircleIcon className="h-20 w-20 text-indigo-600" />
    ),
    [StatusText.SAVING]: <SaveIcon className="h-20 w-20 text-indigo-600" />,
    [StatusText.GENERATING]: (
      <HammerIcon className="h-20 w-20 text-indigo-600 animate-bounce" />
    ),
  };

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      accept: {
        'application/pdf': ['.pdf'],
      },
    });

  const uploadInProgress = progress != null && progress >= 0 && progress <= 100;

  // Define the CSS properties with proper typing for the radial progress
  const progressStyle: Partial<RadialProgressStyle> = {
    '--value': progress?.toString() || '0',
    '--size': '12rem',
    '--thickness': '1.3rem',
  };

  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto">
      {uploadInProgress && (
        <div className="mt-32 flex flex-col justify-center items-center gap-5">
          <div
            className={`radial-progress bg-indigo-300 text-white border-indigo-600 border-4 ${
              progress === 100 && 'hidden'
            }`}
            role="progressbar"
            style={progressStyle as CSSProperties}
          >
            {progress} %
          </div>

          {/* Render Status Icon */}
          {status && statusIcons[status]}

          {/* Display status text */}
          <p className="text-indigo-600 animate-pulse">{status}</p>
        </div>
      )}

      {!uploadInProgress && (
        <div
          {...getRootProps()}
          className={`p-10 border-2 border-dashed mt-10 w-[90%]  border-indigo-600 text-indigo-600 rounded-lg h-96 flex items-center justify-center ${
            isFocused || isDragAccept ? 'bg-indigo-300' : 'bg-indigo-100'
          }`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center">
            {isDragActive ? (
              <>
                <RocketIcon className="h-20 w-20 animate-ping" />
                <p>Drop the files here ...</p>
              </>
            ) : (
              <>
                <CircleArrowDown className="h-20 w-20 animate-bounce" />
                <p>Drag n drop some files here, or click to select files</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default FileUploader;
