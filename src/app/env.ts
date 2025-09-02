const env = {
  appwrite: {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_HOST_URL || "",
    projectID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
    apiKey: process.env.APPWRITE_API_KEY || "",
  },
};

// Log warning if environment variables are missing during build
if (typeof window === "undefined") {
  // Only log during server-side/build time
  if (!env.appwrite.endpoint)
    console.warn("Missing NEXT_PUBLIC_APPWRITE_HOST_URL");
  if (!env.appwrite.projectID)
    console.warn("Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  if (!env.appwrite.apiKey) console.warn("Missing APPWRITE_API_KEY");
}

export default env;
