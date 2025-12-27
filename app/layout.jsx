import "./globals.css";
import ScrollToTop from "@/app/_components/ScrollToTop";
import Providers from "./providers";
import LayoutWrapper from "@/app/_components/LayoutWrapper";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ScrollToTop />
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
