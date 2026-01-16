import React from "react";
import ForgotPassword from "./ForgotPassword";

export const metadata = {
  title: "Forgot Password | Royal Moss Hotel",
  description:
    "Reset your Royal Moss Hotel account password securely and regain access to your bookings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <div>
      <ForgotPassword />
    </div>
  );
}
