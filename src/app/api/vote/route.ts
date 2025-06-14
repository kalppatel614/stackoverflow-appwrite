import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query, AppwriteException } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    //grab the data
    const { votedById, type, typeId, voteStatus } = await request.json();

    //list the document
    const response = await databases.listDocuments(db, voteCollection, [
      Query.equal("type", type),
      Query.equal("typeId", typeId),
      Query.equal("votedById", votedById),
    ]);

    if (response.documents.length > 0) {
      await databases.deleteDocument(
        db,
        voteCollection,
        response.documents[0].$id
      );

      //decrease the reputation
      const QuestionAnswer = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );
      const authorPrefs = await users.getPrefs<UserPrefs>(
        QuestionAnswer.authorId
      );
      await users.updatePrefs<UserPrefs>(QuestionAnswer.authorId, {
        reputation:
          response.documents[0].voteStatus === "upvoted"
            ? Number(authorPrefs.reputation) - 1
            : Number(authorPrefs.reputation) + 1,
      });
    }

    //prev vote does not exist
    if (response.documents[0]?.voteStatus !== voteStatus) {
      await databases.createDocument(db, voteCollection, ID.unique(), {
        type,
        typeId,
        voteStatus,
        votedById,
      });

      // increase or decrease the reputation
      const QuestionAnswer = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );
      const authorPrefs = await users.getPrefs<UserPrefs>(
        QuestionAnswer.authorId
      );
      // if vote was present
      if (response.documents[0]) {
        await users.updatePrefs<UserPrefs>(QuestionAnswer.authorId, {
          reputation:
            response.documents[0].voteStatus === "upvoted"
              ? Number(authorPrefs.reputation) - 1
              : Number(authorPrefs.reputation) + 1,
        });
      } else {
        await users.updatePrefs<UserPrefs>(QuestionAnswer.authorId, {
          reputation:
            voteStatus === "upvoted"
              ? Number(authorPrefs.reputation) + 1
              : Number(authorPrefs.reputation) - 1,
        });
      }
    }

    const [upvotes, downvotes] = await Promise.all([
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("voteStatus", "upvoted"),
        Query.equal("votedById", votedById),
        Query.limit(1),
      ]),
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("voteStatus", "downvoted"),
        Query.equal("votedById", votedById),
        Query.limit(1),
      ]),
    ]);
    return NextResponse.json(
      {
        data: { document: null, voteResult: (upvotes.total = downvotes.total) },
        message: "Vote handled",
      },
      { status: 200 }
    );
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
