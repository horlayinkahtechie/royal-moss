import React from "react";
import Terms from "./terms";

export const metadata = {
  title: "Terms & Conditions | Royal Moss Hotel Badagry",
  description:
    "Read the Terms and Conditions for Royal Moss Hotel in Badagry, Lagos, Nigeria. Learn about booking rules, payments, cancellations, and hotel policies.",
  keywords: [
    "Royal Moss Hotel terms and conditions",
    "Hotel booking rules Badagry",
    "Royal Moss cancellation policy",
    "Hotel policies Lagos",
  ],
  openGraph: {
    title: "Terms & Conditions | Royal Moss Hotel",
    description:
      "Royal Moss Hotel Terms and Conditions explain our policies for bookings, payments, and cancellations.",
    url: "https://royalmoss.org/terms",
    siteName: "Royal Moss Hotel",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | Royal Moss Hotel",
    description:
      "Read the terms and conditions for booking and staying at Royal Moss Hotel, Badagry, Lagos.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return (
    <div>
      <Terms />
    </div>
  );
}
