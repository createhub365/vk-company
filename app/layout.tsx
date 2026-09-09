import type { Metadata } from "next";
import { siteUrl } from "@/lib/config";
import "./globals.css";
import { ImageFeedback } from "@/components/image-feedback";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "VK AND COMPANY | Courier Services", template: "%s | VK AND COMPANY" },
  description: "Domestic and international courier enquiries, quotations and verified shipment tracking from VK AND COMPANY.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ImageFeedback/>{children}</body></html>;
}
