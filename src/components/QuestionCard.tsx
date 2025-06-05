"use client";

import React from "react";
import { BorderBeam } from "./magicui/border-beam";
import Link from "next/link";
import { Models } from "appwrite";
import slugify from "@/utils/slugify";
import { avatars } from "@/models/client/config";
import convertDateToRelativeTime from "@/utils/relativeTime";
import { useRouter } from "next/navigation"; // Import useRouter
import { useAuthStore } from "@/store/Auth"; // Import useAuthStore

type QuestionCardProps = {
  ques: Models.Document & {
    totalVotes: number;
    totalAnswers: number;
    tags: string[];
    author: {
      $id: string;
      name: string;
      reputation: number;
    };
  };
};

const QuestionCard = ({ ques }: QuestionCardProps) => {
  const [height, setHeight] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const router = useRouter(); // Initialize useRouter
  const { session } = useAuthStore(); // Get session from auth store

  React.useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight);
    }
  }, [ref]);

  const handleQuestionClick = (e: React.MouseEvent) => {
    // Prevent the default Link navigation if not logged in
    if (!session) {
      e.preventDefault(); // Stop the Link from navigating
      router.push("/login"); // Redirect to the login page
    }
    // If session exists, the Link component will handle the navigation
  };

  return (
    <div
      ref={ref}
      // Attach the onClick handler to the parent div
      onClick={handleQuestionClick}
      className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-white/20 bg-white/5 p-4 duration-200 hover:bg-white/10 sm:flex-row cursor-pointer" // Add cursor-pointer for better UX
    >
      <BorderBeam size={height} duration={12} delay={9} />
      <div className="relative shrink-0 text-sm sm:text-right">
        <p>{ques.totalVotes} votes</p>
        <p>{ques.totalAnswers} answers</p>
      </div>
      <div className="relative w-full">
        {/*
          We still use Link, but its navigation will be conditionally prevented
          by the handleQuestionClick on the parent div if the user is not logged in.
          If logged in, the Link will behave as normal.
        */}
        <Link
          href={`/questions/${ques.$id}/${slugify(ques.title)}`}
          className="text-orange-500 duration-200 hover:text-orange-600"
          // We can remove the direct onClick here as the parent div handles it
          // Or, keep it if you want the link itself to be clickable but also the whole card
          // For this specific requirement, handling on the parent div is cleaner.
          // You might still want to add an explicit `tabIndex={-1}` to the Link if you don't want it focusable independently
          // and let the parent `div` handle keyboard navigation for accessibility.
        >
          <h2 className="text-xl">{ques.title}</h2>
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          {ques.tags.map((tag: string) => (
            <Link
              key={tag}
              href={`/questions?tag=${tag}`}
              className="inline-block rounded-lg bg-white/10 px-2 py-0.5 duration-200 hover:bg-white/20"
              onClick={(e) => {
                // Prevent redirection for tag links if not logged in
                if (!session) {
                  e.preventDefault();
                  router.push("/login");
                }
              }}
            >
              #{tag}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <picture>
              <img
                src={avatars.getInitials(ques.author.name, 24, 24)}
                alt={ques.author.name}
                className="rounded-lg"
              />
            </picture>
            <Link
              href={`/users/${ques.author.$id}/${slugify(ques.author.name)}`}
              className="text-orange-500 hover:text-orange-600"
              onClick={(e) => {
                // Prevent redirection for author link if not logged in
                if (!session) {
                  e.preventDefault();
                  router.push("/login");
                }
              }}
            >
              {ques.author.name}
            </Link>
            <strong>&quot;{ques.author.reputation}&quot;</strong>
          </div>
          <span>
            asked {convertDateToRelativeTime(new Date(ques.$createdAt))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
