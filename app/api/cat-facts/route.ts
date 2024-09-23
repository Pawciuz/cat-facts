import { NextRequest, NextResponse } from "next/server";
import { interval, mergeMap, startWith } from "rxjs";
// Typy dla danych
type CatFact = {
  fact: string;
};

type RandomUser = {
  name: string;
};

export type FactWithUser = {
  user: string;
  fact: string;
};

async function fetchCatFact(): Promise<CatFact> {
  try {
    const response = await fetch("https://cat-fact.herokuapp.com/facts/random");
    const data = await response.json();
    console.log(response);
    const fact = `${data.text}`;
    return { fact };
  } catch {
    return { fact: "" };
  }
}

async function fetchRandomUser(): Promise<RandomUser> {
  try {
    const response = await fetch("https://randomuser.me/api/");
    const data = await response.json();
    const name = data?.results?.[0]?.login?.username ?? "";
    return { name };
  } catch {
    return { name: "" };
  }
}

const factWithUser$ = interval(10000).pipe(
  startWith(0),
  mergeMap(async () => {
    const factsPromises = Array.from({ length: 6 }).map(() => fetchCatFact());
    const usersPromises = Array.from({ length: 6 }).map(() =>
      fetchRandomUser(),
    );

    const facts = await Promise.all(factsPromises);
    const users = await Promise.all(usersPromises);

    const combined = facts.map((fact, index) => ({
      user: users[index]?.name || "",
      fact: fact.fact,
    }));

    return combined;
  }),
);

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const subscription = factWithUser$.subscribe({
        next: (factsWithUsers) => {
          controller.enqueue(`data: ${JSON.stringify(factsWithUsers)}\n\n`);
        },
        error: (err) => {
          console.error(err);
          controller.error(err);
        },
        complete: () => {
          controller.close();
        },
      });

      request.signal.addEventListener("abort", () => {
        subscription.unsubscribe();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
