import { Theme } from "@navikt/ds-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
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
        <Theme>
          <AppShell>{children}</AppShell>
        </Theme>
      </body>
    </html>
  );
}
