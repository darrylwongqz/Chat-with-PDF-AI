'use client';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Document, Page, pdfjs } from 'react-pdf';
import { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import {
  AlertCircle,
  Loader2Icon,
  RotateCw,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';
import { Input } from './ui/input';

// We need to configure CORS
// gsutil cors set cors.json gs://<app-name>.appspot.com
// gsutil cors set cors.json gs://chat-with-pdf-ai-c0d86.appspot.com
// go here >>> https://console.cloud.google.com/
// create new file in editor calls cors.json
// run >>> // gsutil cors set cors.json gs://chat-with-pdf-ai-c0d86.firebasestorage.app
// https://firebase.google.com/docs/storage/web/download-files#cors_configuration

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfView({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [file, setFile] = useState<Blob | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [pageInputValue, setPageInputValue] = useState<string>('1');
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Fetch the PDF file
  useEffect(() => {
    const fetchFile = async () => {
      try {
        setError(null);

        // Option 1: Try direct loading first (this might work if CORS is eventually set up)
        try {
          const response = await fetch(url, {
            // Add cache control to prevent caching issues
            cache: 'no-store',
            // Add mode: 'cors' explicitly
            mode: 'cors',
            // Add credentials: 'omit' to avoid sending cookies
            credentials: 'omit',
            headers: {
              Accept: 'application/pdf',
            },
          });

          if (response.ok) {
            const file = await response.blob();
            setFile(file);
            return;
          }
        } catch (directError) {
          console.warn(
            'Direct fetch failed, trying alternative method:',
            directError
          );
        }

        // Option 2: If direct loading fails, try loading the PDF directly in the Document component
        // by passing the URL instead of a blob
        setFile(null);

        // Log the URL for debugging
        console.log('Loading PDF directly from URL:', url);
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
      }
    };

    fetchFile();
  }, [url]);

  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.pdf-container');
      if (container) {
        setContainerDimensions({
          width: container.clientWidth,
          height: window.innerHeight - 150, // Adjust for header and controls
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }): void => {
      setNumPages(numPages);
      setError(null);
    },
    []
  );

  const onDocumentLoadError = useCallback((err: Error): void => {
    console.error('Error loading PDF document:', err);
    setError('Failed to load PDF document. Please check if the file is valid.');
  }, []);

  const goToPreviousPage = useCallback(() => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      setPageInputValue(newPage.toString());
    }
  }, [pageNumber]);

  const goToNextPage = useCallback(() => {
    if (numPages && pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      setPageInputValue(newPage.toString());
    }
  }, [pageNumber, numPages]);

  const handleRotate = useCallback(() => {
    setRotation((rotation + 90) % 360);
  }, [rotation]);

  const handleZoomIn = useCallback(() => {
    if (scale < 5) {
      setScale((prevScale) => {
        // When zooming in, we want to ensure the container allows horizontal scrolling
        const container = document.querySelector('.pdf-container');
        if (container && prevScale * 1.2 > 1.5) {
          container.scrollLeft =
            (container.scrollWidth - container.clientWidth) / 2;
        }
        return prevScale * 1.2;
      });
    }
  }, [scale]);

  const handleZoomOut = useCallback(() => {
    if (scale > 0.5) {
      setScale((prevScale) => prevScale / 1.2);
    }
  }, [scale]);

  // Handle keyboard navigation - MOVED AFTER function declarations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'ArrowLeft':
          goToPreviousPage();
          break;
        case 'ArrowRight':
          goToNextPage();
          break;
        case '+':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousPage, goToNextPage, handleZoomIn, handleZoomOut]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };

  const handlePageInputBlur = () => {
    const pageNum = parseInt(pageInputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && numPages && pageNum <= numPages) {
      setPageNumber(pageNum);
    } else {
      setPageInputValue(pageNumber.toString());
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputBlur();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <div className="sticky top-0 z-50 bg-gray-100 p-2 rounded-b-lg w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
          <Button
            variant="outline"
            disabled={pageNumber === 1}
            onClick={goToPreviousPage}
            aria-label="Previous page"
          >
            Previous
          </Button>

          <div className="flex items-center justify-center space-x-1">
            <Input
              className="w-16 text-center"
              value={pageInputValue}
              onChange={handlePageInputChange}
              onBlur={handlePageInputBlur}
              onKeyDown={handlePageInputKeyDown}
              aria-label="Current page"
            />
            <span>of {numPages || '?'}</span>
          </div>

          <Button
            variant="outline"
            disabled={!numPages || pageNumber === numPages}
            onClick={goToNextPage}
            aria-label="Next page"
          >
            Next
          </Button>

          <Button
            variant="outline"
            onClick={handleRotate}
            aria-label="Rotate document"
          >
            <RotateCw className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Rotate</span>
          </Button>

          <Button
            variant="outline"
            disabled={scale <= 0.5}
            onClick={handleZoomOut}
            aria-label="Zoom out"
          >
            <ZoomOutIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Zoom Out</span>
          </Button>

          <Button
            variant="outline"
            disabled={scale >= 5} // Increased max zoom
            onClick={handleZoomIn}
            aria-label="Zoom in"
          >
            <ZoomInIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Zoom In</span>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-8 text-red-500">
          <AlertCircle className="h-12 w-12 mb-2" />
          <h3 className="text-lg font-semibold">Error Loading PDF</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="pdf-container overflow-auto h-full w-full flex justify-center">
          {file ? (
            // If we have a blob, use it
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2Icon className="h-12 w-12 animate-spin mb-2" />
                  <p>Loading PDF...</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                width={containerDimensions.width * 0.9}
                height={containerDimensions.height * 0.9}
                scale={scale}
                rotate={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          ) : (
            // If blob loading failed, try direct URL loading
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2Icon className="h-12 w-12 animate-spin mb-2" />
                  <p>Loading PDF, Please Wait a Moment...</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                width={containerDimensions.width * 0.9}
                height={containerDimensions.height * 0.9}
                scale={scale}
                rotate={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2 mb-4">
        Use arrow keys to navigate between pages. Press + to zoom in and - to
        zoom out. When zoomed in, scroll horizontally and vertically to see
        different parts of the page.
      </div>
    </div>
  );
}

export default PdfView;
