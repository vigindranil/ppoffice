"use client";

import { Provider } from "react-redux";
import store from "@/redux/store"; // Import the store
import "./globals.css";
import NextTopLoader from "nextjs-toploader";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>
          Public Prosecutor Office Management
        </title>
      </head>
      <body
      >
        <NextTopLoader />
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}

