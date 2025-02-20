"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Provider } from "react-redux";
import store from "@/redux/store"; // Import the store
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>
          Public Prosecutor Office Management
        </title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader />
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}

