import { CatFact, RandomUser } from "../types";

export async function fetchCatFacts(): Promise<CatFact[]> {
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

export async function fetchRandomUsers(): Promise<RandomUser[]> {
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
