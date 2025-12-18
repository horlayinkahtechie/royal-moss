import { Suspense } from "react";
import BookingVerify from "./booking-status";

export default function page() {
  return (
    <div>
      <Suspense>
        <BookingVerify />
      </Suspense>
    </div>
  );
}
