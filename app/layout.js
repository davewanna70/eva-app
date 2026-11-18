import "./globals.css";
import BottomNav from "../components/BottomNav";

export const metadata = {
  title: "EVA",
  description: "EVA - Movies and Shorts",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <div className="mx-auto min-h-screen w-full max-w-md pb-28">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
