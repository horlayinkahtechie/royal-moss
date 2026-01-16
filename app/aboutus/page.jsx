import React from "react";
import Aboutus from "./aboutus";

export const metadata = {
  title: "About Royal Moss Hotel | Luxury Hotel in Badagry, Lagos",
  description:
    "Learn more about Royal Moss Hotel, a luxury hotel located in Badagry, Lagos, Nigeria. Discover our story, values, amenities, and commitment to excellent hospitality.",
  keywords: [
    "About Royal Moss Hotel",
    "Royal Moss Hotel Badagry",
    "Hotel in Badagry Lagos",
    "Luxury hotel in Badagry",
    "Best hotels in Lagos",
    "Royal Moss Nigeria",
  ],
  openGraph: {
    title: "About Royal Moss Hotel",
    description:
      "Discover the story behind Royal Moss Hotel in Badagry, Lagos. Premium comfort, modern amenities, and exceptional guest experience.",
    url: "https://royalmoss.org/aboutus",
    siteName: "Royal Moss Hotel",
    images: [
      {
        url: "/images/royal-moss.jpg",
        width: 1200,
        height: 630,
        alt: "About Royal Moss Hotel Badagry",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Royal Moss Hotel",
    description:
      "Royal Moss Hotel is a premium hospitality destination in Badagry, Lagos, Nigeria.",
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
      <Aboutus />
    </div>
  );
}
