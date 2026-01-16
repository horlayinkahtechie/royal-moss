import React from "react";
import ContactPage from "./contact";

export const metadata = {
  title: "Contact Royal Moss Hotel | Badagry, Lagos",
  description:
    "Get in touch with Royal Moss Hotel in Badagry, Lagos, Nigeria. Contact us for room reservations, inquiries, support, and customer assistance.",
  keywords: [
    "Contact Royal Moss Hotel",
    "Royal Moss Hotel Badagry contact",
    "Hotel in Badagry Lagos contact",
    "Royal Moss phone number",
    "Royal Moss email",
    "Hotels in Lagos Nigeria",
  ],
  openGraph: {
    title: "Contact Royal Moss Hotel",
    description:
      "Contact Royal Moss Hotel in Badagry, Lagos for bookings, inquiries, and customer support.",
    url: "https://royalmoss.org/contact",
    siteName: "Royal Moss Hotel",
    images: [
      {
        url: "/images/royal-moss.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Royal Moss Hotel Badagry",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Royal Moss Hotel | Badagry",
    description:
      "Reach Royal Moss Hotel in Badagry, Lagos for room bookings and inquiries.",
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
      <ContactPage />
    </div>
  );
}
