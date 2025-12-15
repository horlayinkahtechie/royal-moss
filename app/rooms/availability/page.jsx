import React, { Suspense } from "react";
import Availability from "./availability";

export default function page() {
  return (
    <div>
      <Suspense>
        <Availability />
      </Suspense>
    </div>
  );
}
