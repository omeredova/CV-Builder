import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";

import { DeviceErrorPage } from "@/shared/ui/device-error-page";

import { ApolloProvider } from "./providers/apollo-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Builder",
  description: "Create a CV from your professional experience.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <DeviceErrorPage />
        <div className="hidden md:block">
          <ApolloProvider>{children}</ApolloProvider>
        </div>
      </body>
    </html>
  );
}
