import "./globals.css";
import Footer from "@/app/_components/Footer";
import Navbar from "@/app/_components/Navbar";

import ScrollToTop from "@/app/_components/ScrollToTop";
import Providers from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ScrollToTop />

        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
