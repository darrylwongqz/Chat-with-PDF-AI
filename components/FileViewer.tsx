'use client';

import Chat from '@/components/Chat';
import PdfView from '@/components/PdfView';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface FileViewerProps {
  id: string;
  url: string | null;
}

export default function FileViewer({ id, url }: FileViewerProps) {
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden">
      <PanelGroup direction="horizontal" className="h-full">
        {/* PDF Panel */}
        <Panel
          defaultSize={60}
          minSize={30}
          className="overflow-auto bg-gray-100"
        >
          {url ? (
            <PdfView url={url} />
          ) : (
            <div className="flex items-center justify-center h-full">
              Document not found
            </div>
          )}
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-2 bg-indigo-100 hover:bg-indigo-200 transition-colors">
          <div className="h-full flex items-center justify-center cursor-col-resize">
            <div className="h-10 w-1 bg-indigo-300 rounded-full"></div>
          </div>
        </PanelResizeHandle>

        {/* Chat Panel */}
        <Panel defaultSize={40} minSize={25} className="overflow-hidden">
          <Chat id={id} />
        </Panel>
      </PanelGroup>
    </div>
  );
}
