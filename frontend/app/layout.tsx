import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/components/AuthProvider";
import { ToastProvider } from "@/src/components/Toast";
import { ThemeProvider } from "@/src/components/ThemeProvider";

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Inventory Manager",
  description: "CRUD inventory management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ibmPlex.variable} suppressHydrationWarning>
      <body className={ibmPlex.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');`,
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
