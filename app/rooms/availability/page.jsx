import React, { Suspense } from "react";
import Availability from "./availability";

export const metadata = {
  title: "Check Room Availability | Royal Moss Hotel Badagry, Lagos",
  description:
    "Check the availability of rooms at Royal Moss Hotel in Badagry, Lagos, Nigeria. Find and reserve your preferred room online easily and securely.",
  keywords: [
    "Royal Moss Hotel room availability",
    "Check hotel rooms Badagry",
    "Royal Moss Hotel booking",
    "Hotel rooms Lagos Nigeria",
    "Reserve room Royal Moss Hotel",
  ],
  openGraph: {
    title: "Check Room Availability | Royal Moss Hotel",
    description:
      "Check available rooms at Royal Moss Hotel in Badagry, Lagos and book your stay online securely.",
    url: "https://royalmoss.org/rooms/availability",
    siteName: "Royal Moss Hotel",
    images: [
      {
        url: "/images/royal-moss.jpg",
        width: 1200,
        height: 630,
        alt: "Check Room Availability at Royal Moss Hotel",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Check Room Availability | Royal Moss Hotel",
    description:
      "Find available rooms at Royal Moss Hotel, Badagry, Lagos. Book online safely and quickly.",
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
      <Suspense>
        <Availability />
      </Suspense>
    </div>
  );
}
