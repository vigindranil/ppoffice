"use client";
import React, { Suspense, useEffect, useState } from "react";
import Loading from "./loading";
import AdminSidebarLayout from "@/components/sidebar-layout";
import { useSelector } from "react-redux";
import Footer from '@/components/Footer';
import Header from "@/components/Header";
import { decrypt } from "@/utils/crypto";
import AuthorizationWrapper from "@/components/AuthorizationWrapper";

const Layout = ({children}) => {
  const [user, setUser] = useState("");
  const token = useSelector((state) => state.auth.token);
  const userDetails = useSelector((state) => state.auth.user);

  useEffect(() => {
      if(userDetails)
        {const decryptedUser = JSON.parse(decrypt(userDetails))
      setUser(decryptedUser);}
    }, [userDetails]); 

  const breadcrumb = [
    { name: "Public Prosecutor" },{ href: "/public-prosecutor-user-dashboard", name: "Dashboard" },{ name: "Public Prosecutor Case Details" },
  ];

  return (
    <>
      
      <Header />

      {/* Main Content */}
      <div className="flex flex-col h-full">
        <AdminSidebarLayout breadcrumb={breadcrumb}>
        <AuthorizationWrapper
          authorizedUserTypes={[60]}
          redirectPath="/super-admin-dashboard"
        ></AuthorizationWrapper>
          <div className="flex flex-1">
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </div>
        </AdminSidebarLayout>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
