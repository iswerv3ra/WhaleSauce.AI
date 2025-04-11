// layout.tsx
import './globals.css';
import styles from './layout.module.css';
import { ReactNode } from 'react';
import { FaChartBar, FaDice, FaSearch } from 'react-icons/fa';

import Link from 'next/link';


export const metadata = {
  title: 'UFC Analytical Web App',
  description: 'Dive deep into UFC data, predict outcomes, and create dream matchups',
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#E0EBF5] text-[#333333]">
        <header className="bg-[#77A1D3] p-4 flex items-center justify-between">
          <div className="header-logo flex items-center">
            <span className="text-xl font-bold">UFC Logo</span>
          </div>
          <nav className="ml-auto">
            <ul className="flex space-x-6">
                <li>
                    <Link href="/match-predictor" className={`${styles.navLink} flex items-center`}>
                    <FaChartBar className="mr-2" />
                    Match Predictor
                    </Link>
                </li>
                <li>
                    <Link href="/parlay-generator" className={`${styles.navLink} flex items-center`}>
                    <FaDice className="mr-2" />
                    Parlay Generator
                    </Link>
                </li>
                <li>
                    <Link href="/data-explorer" className={`${styles.navLink} flex items-center`}>
                    <FaSearch className="mr-2" />
                    Data Explorer
                    </Link>
                </li>
            </ul>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
  
}

