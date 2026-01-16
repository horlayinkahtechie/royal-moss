import { Suspense } from "react";
import Book from "./book";

export const metadata = {
  title: "Book a Room | Royal Moss Hotel Badagry, Lagos",
  description:
    "Book a room at Royal Moss Hotel in Badagry, Lagos, Nigeria. Check room availability, choose your dates, and make secure online payments with ease.",
  keywords: [
    "Book Royal Moss Hotel",
    "Hotel booking in Badagry",
    "Book hotel in Lagos",
    "Reserve hotel room Nigeria",
    "Royal Moss room reservation",
    "Hotel room booking Badagry",
  ],
  openGraph: {
    title: "Book a Room at Royal Moss Hotel",
    description:
      "Reserve your stay at Royal Moss Hotel, Badagry. Simple booking, secure payments, and comfortable rooms.",
    url: "https://royalmoss.org/book",
    siteName: "Royal Moss Hotel",
    images: [
      {
        url: "/images/royal-moss.jpg",
        width: 1200,
        height: 630,
        alt: "Book a Room at Royal Moss Hotel",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Room | Royal Moss Hotel",
    description:
      "Securely book your hotel room at Royal Moss Hotel in Badagry, Lagos.",
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
        <Book />
      </Suspense>
    </div>
  );
}
