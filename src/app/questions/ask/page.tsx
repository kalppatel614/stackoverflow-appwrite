// src/app/questions/ask/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/Auth";
import { ID, AppwriteException } from "appwrite";
import {
  db,
  questionAttachmentBucket,
  questionCollection,
} from "@/models/name";
import { databases, storage } from "@/models/client/config";

const AskQuestionPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuthStore();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Basic client-side validation for file type (optional but good practice)
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (e.g., JPG, PNG, GIF).");
        setImageFile(null);
        return;
      }
      // Basic size limit (optional)
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image file size should not exceed 5MB.");
        setImageFile(null);
        return;
      }
      setImageFile(file);
      setError(null); // Clear any previous file-related error
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!user || !user.$id) {
      setError("You must be logged in to ask a question.");
      setIsLoading(false);
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      setIsLoading(false);
      return;
    }

    let uploadedAttachmentId: string | undefined;

    try {
      // 1. Upload Image (if selected)
      if (imageFile) {
        // Ensure questionBucket is correctly defined and exists in your Appwrite console
        const uploadedFile = await storage.createFile(
          questionAttachmentBucket, // Your Appwrite bucket ID for question attachments
          ID.unique(), // Generates a unique ID for the file
          imageFile
        );
        uploadedAttachmentId = uploadedFile.$id; // Store the file's ID
      }

      // 2. Prepare Question Document Data based on your schema
      const newQuestionData: {
        title: string;
        content: string;
        tags: string[];
        authorId: string;
        attachmentId?: string; // This attribute matches your schema
        // You might have other attributes like totalAnswers, totalVotes if you initialize them
        // or they might be added by your backend logic/functions.
        // For now, let's assume content, authorId, title, attachmentId, tags are the primary ones.
      } = {
        title: title.trim(),
        content: content.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean), // Clean up tags
        authorId: user.$id,
      };

      // Only add the attachmentId attribute if an image was uploaded
      if (uploadedAttachmentId) {
        newQuestionData.attachmentId = uploadedAttachmentId;
      }

      console.log("Submitting question data:", newQuestionData); // For debugging

      // 3. Create Question Document in Appwrite Database
      await databases.createDocument(
        db, // Your Appwrite database ID
        questionCollection, // Your Appwrite question collection ID
        ID.unique(), // Generates a unique document ID
        newQuestionData
      );

      // 4. Redirect on success
      router.push("/questions");
    } catch (err: unknown) {
      // Changed 'any' to 'unknown'
      console.error("Error asking question:", err);
      let errorMessage = "Failed to ask question. Please try again.";

      if (err instanceof AppwriteException) {
        // Appwrite specific error message
        errorMessage = err.message;
        // Optionally, you can also check err.code for specific HTTP status codes
        // e.g., if (err.code === 400) errorMessage = "Bad request data.";
      } else if (err instanceof Error) {
        // Generic JavaScript error
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Ask a Question</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="What is your question?"
            suppressHydrationWarning
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Content</label>
          <textarea
            className="w-full p-2 border rounded"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Describe your question in detail..."
            rows={6}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            Tags (comma separated)
          </label>
          <input
            className="w-full p-2 border rounded"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. javascript, nextjs, appwrite"
            suppressHydrationWarning
          />
        </div>
        <div>
          <label htmlFor="image" className="block font-medium mb-1">
            Upload Image (Optional)
          </label>
          <input
            id="image"
            type="file"
            accept="image/*" // Only allow image files
            className="w-full p-2 border rounded-2xl dark:bg-transparent dark:bg-opacity-70  dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200"
            onChange={handleImageChange}
          />
          {imageFile && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Selected file: {imageFile.name}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 text-white rounded"
          suppressHydrationWarning
        >
          {isLoading ? "Submitting..." : "Submit Question"}
        </button>
      </form>
    </div>
  );
};

export default AskQuestionPage;
