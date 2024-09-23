import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge";
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

async function* generateFactsWithUsers(): AsyncGenerator<
  FactWithUser[],
  void,
  unknown
> {
  while (true) {
    const facts = await fetchCatFacts();
    const users = await fetchRandomUsers();
    const combined = facts.map((fact, index) => ({
      user: users[index]?.name || "",
      fact: fact.fact,
    }));
    yield combined;
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Czekaj 10 sekund
  }
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const generator = generateFactsWithUsers();

      const reader = async () => {
        for await (const factsWithUsers of generator) {
          if (request.signal.aborted) {
            controller.close();
            return;
          }
          const data = `data: ${JSON.stringify(factsWithUsers)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      };

      reader().catch((err) => {
        console.error(err);
        controller.error(err);
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
