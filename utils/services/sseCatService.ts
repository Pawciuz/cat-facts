import { FactWithUser } from "@/app/api/cat-facts/route";
import { Observable } from "rxjs";

export const createSSEObservable = (): Observable<FactWithUser[]> => {
  return new Observable((subscriber) => {
    const eventSource = new EventSource("/api/cat-facts");

    eventSource.onmessage = (event) => {
      const newFact = JSON.parse(event.data);
      subscriber.next(newFact);
    };

    eventSource.onerror = () => {
      console.error("Error in EventSource.");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  });
};
