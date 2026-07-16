// app/layout.tsx
//
// Required by Next.js App Router — every app/ tree needs exactly one root
// layout providing <html>/<body>. This didn't exist anywhere in the build
// yet; without it, app/page.tsx cannot compile or render at all. Kept
// deliberately minimal: no design-system logic lives here, that's
// PortfolioShell's job.

import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Moataz Alaa — Portfolio",
  description: "Flight Fulfillment & Operations Specialist",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
