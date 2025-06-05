import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconCloud } from "@/components/magicui/icon-cloud";
import LatestQuestions from "./components/LatestQuestions";
import TopContributers from "./components/TopContributers";
import Footer from "./components/Footer";

const slugs = [
  "typescript",
  "javascript",
  "dart",
  "java",
  "react",
  "flutter",
  "android",
  "html5",
  "css3",
  "nodedotjs",
  "express",
  "nextdotjs",
  "prisma",
  "amazonaws",
  "postgresql",
  "firebase",
  "nginx",
  "vercel",
  "testinglibrary",
  "jest",
  "cypress",
  "docker",
  "git",
  "jira",
  "github",
  "gitlab",
  "visualstudiocode",
  "androidstudio",
  "sonarqube",
  "figma",
];

function IconCloudDemo() {
  const images = slugs.map(
    (slug) => `https://cdn.simpleicons.org/${slug}/${slug}`
  );

  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden">
      <IconCloud images={images} />
    </div>
  );
}
export default function Home() {
  return (
    <main className="min-h-screen w-full bg-black text-white px-4 md:px-12 py-10">
      <div className="max-w-7xl mx-auto space-y-16 mt-40">
        {/*name and cloud*/}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col justify-center items-start space-y-4">
            <h1 className="text-5xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600">
              RiverFlow
            </h1>
            <h2 className="text-xl font-semibold">Ask And Learn</h2>
          </div>
          <div className="h-[400px] w-full">
            <IconCloudDemo />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 mt-40">
          <div className="w-full max-h-[400px] overflow-y-auto pr-2">
            <h2 className="text-2xl font-semibold mb-4">Latest Questions</h2>
            <LatestQuestions />
          </div>
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Top Contributors
            </h2>
            <TopContributers />
          </div>
        </div>
      </div>
      <div className="bottom-0 left-0 w-full">
        <Footer />
      </div>
    </main>
  );
}
