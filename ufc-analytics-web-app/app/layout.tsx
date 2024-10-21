// layout.tsx
import './globals.css'; // Import your global styles here
import { ReactNode } from 'react';

export const metadata = {
  title: 'UFC Analytical Web App',
  description: 'Dive deep into UFC data, predict outcomes, and create dream matchups',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-red-900 to-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}
