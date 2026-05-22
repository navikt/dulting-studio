import { Theme } from "@navikt/ds-react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "dulting-studio",
  description:
    "Intern beslutningsapp for dulting, tiltakspakker og datagrenset vurdering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body>
        <Theme>{children}</Theme>
      </body>
    </html>
  );
}
