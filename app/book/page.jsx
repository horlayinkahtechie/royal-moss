import { Suspense } from "react";
import Book from "./book";

export default function page() {
  return (
    <div>
      <Suspense>
        <Book />
      </Suspense>
    </div>
  );
}
