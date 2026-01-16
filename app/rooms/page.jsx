import Rooms from "./rooms";

export const metadata = {
  title: "All Rooms | Royal Moss Hotel Badagry, Lagos",
  description:
    "View all available rooms at Royal Moss Hotel in Badagry, Lagos, Nigeria. Explore luxury rooms, check availability, and book online securely.",
  keywords: [
    "Royal Moss Hotel rooms",
    "Hotel rooms Badagry",
    "All rooms Royal Moss",
    "Luxury hotel rooms Lagos",
    "Book hotel rooms Badagry",
    "Hotels in Lagos",
    "Hotels in Badagry",
  ],
  openGraph: {
    title: "All Rooms | Royal Moss Hotel",
    description:
      "Explore all available rooms at Royal Moss Hotel in Badagry, Lagos. Book your stay online easily and securely.",
    url: "https://royalmoss.org/rooms/all",
    siteName: "Royal Moss Hotel",
    images: [
      {
        url: "/images/royal-moss.jpg",
        width: 1200,
        height: 630,
        alt: "All Rooms at Royal Moss Hotel Badagry",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Rooms | Royal Moss Hotel",
    description:
      "View all available rooms at Royal Moss Hotel in Badagry, Lagos.",
    images: ["/images/royal-moss.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function page() {
  return (
    <div>
      <Rooms />
    </div>
  );
}
