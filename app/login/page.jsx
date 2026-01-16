import React from "react";
import Login from "./login";

export const metadata = {
  title: "Login | Royal Moss Hotel",
  description:
    "Login to your Royal Moss Hotel account to manage bookings and reservations securely.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <div>
      <Login />
    </div>
  );
}
