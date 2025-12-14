import "./globals.css";
import Footer from "@/app/_components/Footer";
import Navbar from "@/app/_components/Navbar";
import Providers from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
