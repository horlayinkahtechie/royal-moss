import React from "react";
import Faq from "./faq";

export const metadata = {
  title: "Frequently Asked Questions | Royal Moss Hotel Badagry",
  description:
    "Find answers to frequently asked questions about Royal Moss Hotel in Badagry, Lagos. Learn about check-in times, bookings, payments, cancellations, and hotel policies.",
  keywords: [
    "Royal Moss Hotel FAQ",
    "Hotel FAQ Badagry",
    "Royal Moss check-in time",
    "Hotel booking questions Lagos",
    "Royal Moss payment methods",
    "Royal Moss cancellation policy",
  ],
  openGraph: {
    title: "Royal Moss Hotel FAQs",
    description:
      "Answers to common questions about Royal Moss Hotel in Badagry, Lagos. Booking, payments, check-in, and hotel policies explained.",
    url: "https://royalmoss.org/faq",
    siteName: "Royal Moss Hotel",
    images: [
      {
        url: "/images/royal-moss.jpg",
        width: 1200,
        height: 630,
        alt: "Royal Moss Hotel Frequently Asked Questions",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQs | Royal Moss Hotel",
    description:
      "Frequently asked questions about Royal Moss Hotel in Badagry, Lagos.",
    images: ["/images/royal-moss.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return (
    <div>
      <Faq />
    </div>
  );
}
