import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "An actions example",
  description: "Created by Ameowagi!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
