import { CatFacts } from "@/components/CatFacts";
import { CardSkeleton } from "@/components/ui";
import { Suspense } from "react";

const Home = async () => {
  return (
    <>
      <h1 className="text-2xl font-bold m-6 text-center">
        Random Cat Facts with Users
      </h1>
      <Suspense fallback={<CardSkeleton />}>
        <CatFacts />
      </Suspense>
    </>
  );
};
export default Home;
