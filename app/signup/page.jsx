import React from "react";
import Signup from "./signup";

export const metadata = {
  title: "Create Account | Royal Moss Hotel",
  description:
    "Sign up for a Royal Moss Hotel account to manage bookings and reservations securely.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <div>
      <Signup />
    </div>
  );
}
