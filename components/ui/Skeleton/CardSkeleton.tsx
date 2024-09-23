import { Skeleton } from "./skeleton";

const CardSkeleton = () => {
  return (
    <>
      <p className="text-center ">Loading ...</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="h-[40vh]"></Skeleton>
        ))}
      </div>
    </>
  );
};
export { CardSkeleton };
