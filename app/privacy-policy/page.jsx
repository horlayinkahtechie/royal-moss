import React from "react";
import PrivacyPolicy from "./privacy-policy";

export const metadata = {
  title: "Privacy Policy | Royal Moss Hotel Badagry",
  description:
    "Read the Privacy Policy of Royal Moss Hotel, Badagry, Lagos, Nigeria. Learn how we collect, use, protect, and manage your personal information.",
  keywords: [
    "Royal Moss Hotel privacy policy",
    "Hotel privacy policy Nigeria",
    "Royal Moss data protection",
    "Hotel booking privacy Lagos",
  ],
  openGraph: {
    title: "Privacy Policy | Royal Moss Hotel",
    description:
      "Royal Moss Hotel Privacy Policy explains how we handle and protect customer data.",
    url: "https://royalmoss.org/privacy-policy",
    siteName: "Royal Moss Hotel",
    locale: "en_NG",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return (
    <div>
      <PrivacyPolicy />
    </div>
  );
}
