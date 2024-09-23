import { Observable } from "rxjs";
import { FactWithUser } from "@/utils/api";

export const createSSEObservable = (): Observable<FactWithUser[]> => {
  return new Observable((subscriber) => {
    const eventSource = new EventSource("/api/get/cat-facts");

    eventSource.onmessage = (event) => {
      const newFact = JSON.parse(event.data);
      subscriber.next(newFact);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  });
};
