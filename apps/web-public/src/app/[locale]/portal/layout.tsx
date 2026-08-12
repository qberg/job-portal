import { type ReactNode, ViewTransition } from "react";

const locales = ["en"];
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ViewTransition
          default="none"
          enter={{
            default: "none",
            "locale-switch": "locale-fade",
            "nav-back": "nav-back",
            "nav-forward": "nav-forward",
          }}
          exit={{
            default: "none",
            "locale-switch": "locale-fade",
            "nav-back": "nav-back",
            "nav-forward": "nav-forward",
          }}
        >
          {children}
        </ViewTransition>
      </body>
    </html>
  );
}
