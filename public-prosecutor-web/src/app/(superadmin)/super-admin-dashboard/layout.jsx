"use client";
import React, { Suspense, useEffect, useState } from "react";
import Loading from "./loading";
import AdminSidebarLayout from "@/components/sidebar-layout";
import { useSelector } from "react-redux";
import Footer from '@/components/Footer';
import Header from "@/components/Header";
import AuthorizationWrapper from "@/components/AuthorizationWrapper";
import { decrypt } from "@/utils/crypto";

const Layout = ({children}) => {
  const [authToken, setAuthToken] = useState("");
  const [user, setUser] = useState("");
  const token = useSelector((state) => state.auth.token);
  const userDetails = useSelector((state) => state.auth.user);

  useEffect(() => {
    if(userDetails)
      {const decryptedUser = JSON.parse(decrypt(userDetails))
    setUser(decryptedUser);}
  }, [userDetails]); 

  const breadcrumb = [
    { name: "Super Admin" }, { name: "Dashboard" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <AdminSidebarLayout breadcrumb={breadcrumb}>
        <AuthorizationWrapper
          authorizedUserTypes={[100]}
          redirectPath="/super-admin-dashboard"
        ></AuthorizationWrapper>
          <div className="flex-1">
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </div>
        </AdminSidebarLayout>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
