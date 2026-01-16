import React from "react";
import Gallery from "./gallery";

export const metadata = {
  title: "Hotel Gallery | Royal Moss Hotel Badagry, Lagos",
  description:
    "Explore photos of Royal Moss Hotel in Badagry, Lagos, Nigeria. View our luxury rooms, amenities, interiors, and surroundings before booking your stay.",
  keywords: [
    "Royal Moss Hotel gallery",
    "Hotel photos Badagry",
    "Royal Moss rooms pictures",
    "Luxury hotel in Badagry",
    "Hotels in Lagos Nigeria",
  ],
  openGraph: {
    title: "Royal Moss Hotel Gallery",
    description:
      "View photos of Royal Moss Hotel in Badagry, Lagos. Discover our rooms, amenities, and premium hospitality experience.",
    url: "https://royalmoss.org/gallery",
    siteName: "Royal Moss Hotel",
    images: [
      {
        url: "/images/royal-moss.jpg",
        width: 1200,
        height: 630,
        alt: "Royal Moss Hotel Gallery",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery | Royal Moss Hotel",
    description: "Browse images of Royal Moss Hotel in Badagry, Lagos.",
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
      <Gallery />
    </div>
  );
}
