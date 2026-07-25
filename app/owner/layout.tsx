import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Private Atelier | FLORA",
  description: "Private owner access for FLORA collection image uploads.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return children;
}
