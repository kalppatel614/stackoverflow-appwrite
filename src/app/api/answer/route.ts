import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { NextResponse, NextRequest } from "next/server";
import { ID, AppwriteException } from "node-appwrite";
import { UserPrefs } from "@/store/Auth";

export async function POST(request: NextRequest) {
  try {
    const { questionId, answer, authorId } = await request.json();
    const response = await databases.createDocument(
      db,
      answerCollection,
      ID.unique(),
      {
        content: answer,
        authorId: authorId,
        questionId: questionId,
      }
    );

    //increase author reputations
    const prefs = await users.getPrefs<UserPrefs>(authorId);
    await users.updatePrefs(authorId, {
      reputation: Number(prefs.reputation) + 1,
    });
    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    let errorMessage = "Error Creating Answer";
    let statusCode = 500;

    if (error instanceof AppwriteException) {
      // If it's an AppwriteException, use its message and code
      errorMessage = error.message;
      statusCode = error.code; // AppwriteException 'code' often maps to HTTP status
    } else if (error instanceof Error) {
      // For generic JavaScript Errors
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { answerId } = await request.json();

    const answer = await databases.getDocument(db, answerCollection, answerId);
    const response = await databases.deleteDocument(
      db,
      answerCollection,
      answerId
    );

    //decrease the reputation
    const prefs = await users.getPrefs<UserPrefs>(answer.authorId);
    await users.updatePrefs(answer.authorId, {
      reputation: Number(prefs.reputation) - 1,
    });
    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error: unknown) {
    // Changed 'any' to 'unknown'
    let errorMessage = "Error Deleting Answer";
    let statusCode = 500;

    if (error instanceof AppwriteException) {
      errorMessage = error.message;
      statusCode = error.code;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
