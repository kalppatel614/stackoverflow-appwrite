import QuestionCard from "@/components/QuestionCard";
import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Query } from "node-appwrite";
import React from "react";
import type { Models } from "appwrite";

type ExtendedQuestion = Models.Document & {
  totalVotes: number;
  totalAnswers: number;
  tags: string[];
  author: {
    $id: string;
    name: string;
    reputation: number;
  };
};
const LatestQuestions = async () => {
  const questions = await databases.listDocuments(db, questionCollection, [
    Query.limit(5),
    Query.orderDesc("$createdAt"),
  ]);
  console.log("Fetched Questions:", questions);

  const extendedDocuments: ExtendedQuestion[] = await Promise.all(
    questions.documents.map(async (ques) => {
      const [author, answers, votes] = await Promise.all([
        users.get<UserPrefs>(ques.authorId),
        databases.listDocuments(db, answerCollection, [
          Query.equal("questionId", ques.$id),
          Query.limit(1), // for optimization
        ]),
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", "question"),
          Query.equal("typeId", ques.$id),
          Query.limit(1), // for optimization
        ]),
      ]);

      return {
        ...ques,
        totalAnswers: answers.total,
        totalVotes: votes.total,
        tags: ques.tags ?? [],
        author: {
          $id: author.$id,
          reputation: author.prefs.reputation,
          name: author.name,
        },
      };
    })
  );

  console.log("Latest question");
  console.log(questions);
  return (
    <div className="space-y-6">
      {extendedDocuments.map((question) => (
        <QuestionCard key={question.$id} ques={question} />
      ))}
    </div>
  );
};

export default LatestQuestions;
