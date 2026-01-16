import Index from "@/app/_components/Index";

export const metadata = {
  title: "Royal Moss Hotel | Luxury Hotel in Badagry, Lagos",
  description:
    "Royal Moss Hotel is a premium hotel in Badagry, Lagos, Nigeria. Book luxury rooms, enjoy modern amenities, secure online payments, and a comfortable stay.",
  keywords: [
    "Royal Moss Hotel",
    "Hotel in Badagry",
    "Hotels in Lagos",
    "Luxury hotel in Badagry",
    "Book hotel in Lagos",
    "Hotel reservation Nigeria",
    "Royal Moss Badagry",
    "Hotels in Badagry",
    "Lagos Beach",
  ],
  openGraph: {
    title: "Royal Moss Hotel | Book Luxury Rooms in Badagry",
    description:
      "Book your stay at Royal Moss Hotel in Badagry, Lagos. Comfortable rooms, modern facilities, and secure online booking.",
    url: "https://royalmoss.org",
    siteName: "Royal Moss Hotel",
    images: [
      {
        url: "/images/royal-moss.jpg",
        width: 1200,
        height: 630,
        alt: "Royal Moss Hotel Badagry",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Royal Moss Hotel | Badagry, Lagos",
    description:
      "Luxury hotel in Badagry, Lagos. Book rooms online and enjoy premium hospitality.",
    images: ["/images/royal-moss.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return <Index />;
}
