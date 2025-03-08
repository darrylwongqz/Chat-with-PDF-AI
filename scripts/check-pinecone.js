// Script to check Pinecone configuration
require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

const indexName = 'papafam'; // This should match the indexName in lib/langchain.ts

async function checkPineconeSetup() {
  try {
    console.log('Checking Pinecone API key...');
    if (!process.env.PINECONE_API_KEY) {
      console.error(
        '❌ PINECONE_API_KEY is not set in your environment variables'
      );
      return false;
    }
    console.log('✅ PINECONE_API_KEY is set');

    console.log('Initializing Pinecone client...');
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log('Listing Pinecone indexes...');
    const indexes = await pinecone.listIndexes();
    console.log('Available indexes:', indexes);

    const targetIndex = indexes.indexes?.find(
      (index) => index.name === indexName
    );

    if (targetIndex) {
      console.log(`✅ Index '${indexName}' exists`);

      // Get more details about the index
      const indexDetails = await pinecone.describeIndex(indexName);
      console.log('Index details:', indexDetails);

      return true;
    } else {
      console.error(`❌ Index '${indexName}' does not exist`);
      console.log('\nTo create this index, you can:');
      console.log('1. Use the Pinecone dashboard: https://app.pinecone.io/');
      console.log(
        `2. Create an index named '${indexName}' with appropriate settings`
      );
      console.log('   - Recommended dimensions: 1536 (for OpenAI embeddings)');
      console.log('   - Metric: cosine');
      return false;
    }
  } catch (error) {
    console.error('Error checking Pinecone setup:', error);
    return false;
  }
}

checkPineconeSetup()
  .then((result) => {
    if (result) {
      console.log('\n✅ Pinecone setup is correct');
    } else {
      console.log('\n❌ Pinecone setup needs attention');
    }
    process.exit(result ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
