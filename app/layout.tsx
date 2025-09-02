import "../styles/globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="editor-shell">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">
              TipTap RTE with Inline Comments
            </h1>
            <p className="text-sm text-gray-600">
              Next.js App Router • SSR safe • Tailwind
            </p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
