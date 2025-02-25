"use client";
import React, { Suspense, useEffect, useState } from "react";
import AuthorizationWrapper from "@/components/AuthorizationWrapper";
import Loading from "./loading";
import AdminSidebarLayout from "@/components/sidebar-layout";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const Layout = ({ children }) => {
  

  const breadcrumb = [
    { name: "Office Admin" },
    { href: "/pp-office-admin-dashboard", name: "Dashboard" },
    { name: "User List" },
  ];

  return (
    <>
      <Header />

      {/* Main Content */}
      <div className="flex flex-col h-full">
        <AdminSidebarLayout breadcrumb={breadcrumb}>
        <AuthorizationWrapper
          authorizedUserTypes={[10]}
          redirectPath="/pp-office-admin-dashboard"
        ></AuthorizationWrapper>
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
