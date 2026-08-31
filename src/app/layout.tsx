import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ApolloProvider } from "./providers/apollo-provider";

export const metadata: Metadata = {
  title: "CV Builder",
  description: "Create a CV from your professional experience.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ApolloProvider>{children}</ApolloProvider>
      </body>
    </html>
  );
}
