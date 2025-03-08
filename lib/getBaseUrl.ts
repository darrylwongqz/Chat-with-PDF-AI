const getBaseUrl = () => {
  // For local development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // For production - hardcoded production URL
  return 'https://chat-with-pdf-ai-three.vercel.app';
};

export default getBaseUrl;
