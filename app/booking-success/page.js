import { Suspense } from "react";
import BookingSuccess from "./booking-success";

export default function page() {
  return (
    <div>
      <Suspense>
        <BookingSuccess />
      </Suspense>
    </div>
  );
}
