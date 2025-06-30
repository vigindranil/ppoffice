"use client";
import React, { Suspense, useEffect, useState } from "react";
import Loading from "./loading";
import AdminSidebarLayout from "@/components/sidebar-layout";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AuthorizationWrapper from "@/components/AuthorizationWrapper";
import { decrypt } from "@/utils/crypto";
import { useSelector } from "react-redux";

const Layout = ({ children }) => {
  const [user, setUser] = useState("");
  const token = useSelector((state) => state.auth.token);
  const userDetails = useSelector((state) => state.auth.user);

  useEffect(() => {
    if(userDetails)
      {const decryptedUser = JSON.parse(decrypt(userDetails))
    setUser(decryptedUser);}
  }, [userDetails]); 
  

  const breadcrumb = [
    { name: "PP Head Admin" },
    { href: "/pp-head-dashboard", name: "Dashboard" },
    { name: "Assigned Advocates List" },
  ];

  return (
    <>
      <Header />

      {/* Main Content */}
      <div className="flex flex-col h-full">
        <AdminSidebarLayout breadcrumb={breadcrumb}>
        <AuthorizationWrapper
          authorizedUserTypes={[20]}
          redirectPath="/pp-head-dashboard"
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
