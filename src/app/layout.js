import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Cagnotte Metamorphoo",
  description: "Plateforme de don solidaire",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        {children}
      </body>
    </html>
  );
}
