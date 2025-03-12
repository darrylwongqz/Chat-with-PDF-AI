import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
import { ProgressBar } from '@/components/ui/progress-bar';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen h-screen flex flex-col">
          <ProgressBar />
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
