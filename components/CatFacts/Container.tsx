import { CatFacts } from "./CatFacts";
import { fetchCatFacts, fetchRandomUsers } from "@/utils/api";

const Container = async () => {
  const facts = await fetchCatFacts();
  const users = await fetchRandomUsers();
  const initialFacts = facts.map((fact: { fact: string }, index: number) => ({
    fact: fact.fact,
    user: users[index].name,
  }));
  return <CatFacts initialFacts={initialFacts} />;
};
export default Container;
