import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gourmet Hunter",
  description: "The best recipes on Earth.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  // Try new combined session cookie first, fall back to old separate cookies
  const sessionCookie = cookieStore.get("session")?.value;
  let isLoggedIn = false;
  let username: string | undefined;

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie);
      isLoggedIn = !!session.token;
      username = session.username;
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Fallback to old cookies for backwards compatibility
  if (!isLoggedIn) {
    isLoggedIn = cookieStore.has("session_token");
  }
  if (!username) {
    username = cookieStore.get("username")?.value;
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar isLoggedIn={isLoggedIn} username={username} />

        {children}
      </body>
    </html>
  );
}
