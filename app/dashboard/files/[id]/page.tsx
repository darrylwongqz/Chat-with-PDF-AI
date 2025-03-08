import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/firebaseAdmin';
import FileViewer from '../../../../components/FileViewer';

// This is a Server Component
export default async function ChatToFilePage({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  // Server-side authentication
  const { userId } = await auth();

  if (!userId) {
    return <div>Not authenticated</div>;
  }

  // Server-side data fetching
  const ref = await adminDb
    .collection('users')
    .doc(userId)
    .collection('files')
    .doc(id)
    .get();

  const url = ref.data()?.downloadUrl || null;

  // Pass the data to a Client Component
  return <FileViewer id={id} url={url} />;
}
