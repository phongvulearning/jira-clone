import type { Metadata } from "next";

import { Inter } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/app/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your work - Jira",
  description: "Manage your Jira boards with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "min-h-screen antialiased")}>
        <QueryProvider>
          <Toaster richColors theme="light" />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
