import React from "react";
import Services from "./services";

export const metadata = {
  title: "Our Services | Royal Moss Hotel Badagry, Lagos",
  description:
    "Discover the services offered by Royal Moss Hotel in Badagry, Lagos, Nigeria. From luxury room accommodations to dining, amenities, and exceptional customer service.",
  keywords: [
    "Royal Moss Hotel services",
    "Hotel services Badagry",
    "Luxury hotel amenities Lagos",
    "Room service Royal Moss Hotel",
    "Hotel facilities Badagry Nigeria",
  ],
  openGraph: {
    title: "Our Services | Royal Moss Hotel",
    description:
      "Explore the premium services and facilities at Royal Moss Hotel, Badagry, Lagos. Comfortable rooms, dining, amenities, and exceptional hospitality.",
    url: "https://royalmoss.org/services",
    siteName: "Royal Moss Hotel",
    images: [
      {
        url: "/images/royal-moss.jpg",
        width: 1200,
        height: 630,
        alt: "Royal Moss Hotel Services",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Services | Royal Moss Hotel",
    description:
      "Discover the range of services offered at Royal Moss Hotel in Badagry, Lagos.",
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
      <Services />
    </div>
  );
}
