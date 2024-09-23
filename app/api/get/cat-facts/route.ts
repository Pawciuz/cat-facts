import { FactWithUser, fetchCatFacts, fetchRandomUsers } from "@/utils/api";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge";

async function* generateFactsWithUsers(): AsyncGenerator<
  FactWithUser[],
  void,
  unknown
> {
  while (true) {
    const startTime = Date.now();

    const facts = await fetchCatFacts();
    const users = await fetchRandomUsers();
    const combined = facts.map((fact, index) => ({
      user: users[index]?.name || "",
      fact: fact.fact,
    }));

    const endTime = Date.now();
    const fetchDuration = endTime - startTime;

    const waitTime = Math.max(10000 - fetchDuration, 0);

    await new Promise((resolve) => setTimeout(resolve, waitTime));
    yield combined;
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
