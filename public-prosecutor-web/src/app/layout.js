"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Provider } from "react-redux";
import store from "@/redux/store"; // Import the Redux store
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
// Correct the import path if necessary

// Import fonts
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
        <title>Public Prosecutor Office Management</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap the application with the Redux Provider */}
        <Provider store={store}>
          {/* Provide the Sidebar context */}
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </Provider>
      </body>
    </html>
  );
}
