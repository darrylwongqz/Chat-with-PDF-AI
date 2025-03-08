import { adminDb } from '@/firebaseAdmin';
import PlaceholderDocument from './PlaceholderDocument';
import { auth } from '@clerk/nextjs/server';
import Document from './Document';

async function Documents() {
  try {
    // Protect the route
    auth().protect();

    // Get the user ID
    const { userId } = await auth();

    if (!userId) {
      console.log('No user ID found');
      return (
        <div className="flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
          <p>Please sign in to view your documents.</p>
        </div>
      );
    }

    console.log(`Fetching documents for user: ${userId}`);

    // Check if user document exists first
    const userDoc = await adminDb.collection('users').doc(userId).get();

    // If user document doesn't exist, create it
    if (!userDoc.exists) {
      console.log(`User document doesn't exist for ${userId}, creating it now`);
      try {
        await adminDb.collection('users').doc(userId).set({
          createdAt: new Date(),
          userId: userId,
        });
        console.log(`Created user document for ${userId}`);
      } catch (error) {
        console.error('Error creating user document:', error);
      }

      // Return early with just the placeholder since we know there are no files yet
      return (
        <div className="flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
          <PlaceholderDocument />
        </div>
      );
    }

    // Now try to get the files collection
    let documentsSnapshot;
    try {
      documentsSnapshot = await adminDb
        .collection('users')
        .doc(userId)
        .collection('files')
        .get();

      console.log(`Found ${documentsSnapshot.docs.length} documents`);
    } catch (error) {
      console.error('Error fetching files collection:', error);
      // Return a fallback UI if we can't get the files
      return (
        <div className="flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
          <p>Error loading your documents. Please try again later.</p>
          <PlaceholderDocument />
        </div>
      );
    }

    // Check if we have any documents
    const hasDocuments = documentsSnapshot && !documentsSnapshot.empty;

    return (
      <div className="flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
        {/* Map through the documents if they exist */}
        {hasDocuments &&
          documentsSnapshot.docs.map((doc) => {
            // Defensive check for document data
            const data = doc.data();
            if (!data) return null;

            const { name, downloadUrl, size } = data;

            // Make sure we have the required fields
            if (!name || !downloadUrl) {
              console.warn(`Document ${doc.id} is missing required fields`);
              return null;
            }

            return (
              <Document
                key={doc.id}
                id={doc.id}
                name={name}
                size={size || 0}
                downloadUrl={downloadUrl}
              />
            );
          })}

        {/* Always show the placeholder document */}
        <PlaceholderDocument />
      </div>
    );
  } catch (error) {
    console.error('Error in Documents component:', error);
    // Fallback UI for any unexpected errors
    return (
      <div className="flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
        <PlaceholderDocument />
      </div>
    );
  }
}
export default Documents;
