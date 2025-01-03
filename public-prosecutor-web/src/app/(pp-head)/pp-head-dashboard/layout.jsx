"use client";
import React, { Suspense, useEffect, useState } from "react";
import Loading from "./loading";
import AdminSidebarLayout from "@/components/SidbarProvider";
import { useSelector } from "react-redux";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const Layout = ({ children }) => {
  const [authToken, setAuthToken] = useState("");
  const [user, setUser] = useState("");
  const token = useSelector((state) => state.auth.token);
  const userDetails = useSelector((state) => state.auth.user);

  useEffect(() => {
    setAuthToken(token);
    setUser(userDetails);
  }, [token, userDetails]);

  const breadcrumb = [
    { href: "#", name: "PP Head Admin" },
    { href: "/pp-head-dashboard", name: "Dashboard" }
  ];

  return (
    <>
      <Header />

      {/* Main Content */}
      <div className="flex flex-col h-full">
        <AdminSidebarLayout breadcrumb={breadcrumb}>
          <div className="flex flex-1">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </div>
        </AdminSidebarLayout>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
