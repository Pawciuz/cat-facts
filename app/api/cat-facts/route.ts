import { NextRequest, NextResponse } from "next/server";
import { from, interval, map, startWith, switchMap } from "rxjs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
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

async function fetchCatFacts(): Promise<CatFact[]> {
  try {
    const response = await fetch(
      "https://cat-fact.herokuapp.com/facts/random?amount=6",
    );
    const data = await response.json();
    return data.map((item: { text: string }) => ({ fact: item.text }));
  } catch {
    return Array(6).fill({ fact: "" });
  }
}

async function fetchRandomUsers(): Promise<RandomUser[]> {
  try {
    const response = await fetch("https://randomuser.me/api/?results=6");
    const data = await response.json();
    return data.results.map((user: { login: { username: string } }) => ({
      name: user.login.username,
    }));
  } catch {
    return Array(6).fill({ name: "" });
  }
}

const factWithUser$ = interval(10000).pipe(
  startWith(0),
  switchMap(() =>
    from(Promise.all([fetchCatFacts(), fetchRandomUsers()])).pipe(
      map(([facts, users]) =>
        facts.map((fact, index) => ({
          user: users[index]?.name || "",
          fact: fact.fact,
        })),
      ),
    ),
  ),
);

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const subscription = factWithUser$.subscribe({
        next: (factsWithUsers) => {
          const data = `data: ${JSON.stringify(factsWithUsers)}\n\n`;
          controller.enqueue(encoder.encode(data));
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
