"use client";
import React, { Suspense, useEffect, useState } from "react";
import Loading from "./loading";
import AdminSidebarLayout from "@/components/SidbarProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const Layout = ({ children }) => {


  const breadcrumb = [
    { href: "#", name: "PP Head Admin" },
    { href: "/pp-head-dashboard", name: "Dashboard" },
    { href: "/add-pp-user", name: "Add PP User" },
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