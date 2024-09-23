"use client";
import { FactWithUser } from "@/app/api/cat-facts/route";
import { createSSEObservable } from "@/utils/services/sseCatService";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Loader2 } from "lucide-react";

const CatFacts = () => {
  const [facts, setFacts] = useState<FactWithUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    const subscription = createSSEObservable().subscribe({
      next: (newFacts) => {
        setFacts(() => [...newFacts]);
        setTimer(0);
      },
      error: (err) => {
        setError(err.message);
      },
    });

    const timerInterval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(timerInterval);
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold m-6 text-center">
        Random Cat Facts with Users
      </h1>
      <p className="text-center">Timer: {timer} seconds</p>
      {facts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-5 ">
          {facts.map((fact, index) => (
            <Card
              key={index}
              className="shadow-md h-[40vh] flex flex-col justify-center items-center overflow-hidden"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  {fact.user}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xl max-h-[80%]">
                <p>{fact.fact}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center">
          <p>{error ?? <Loader2 size={200} className="animate-spin" />}</p>
        </div>
      )}
    </div>
  );
};

export default CatFacts;
