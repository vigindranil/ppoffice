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
  const [user, setUser] = useState("");
  const token = useSelector((state) => state.auth.token);
  const userDetails = useSelector((state) => state.auth.user);

  useEffect(() => {
    if(userDetails)
      {const decryptedUser = JSON.parse(decrypt(userDetails))
    setUser(decryptedUser);}
  }, [userDetails]); 

  // const type = user?.data[0].AuthorityTypeID

  const breadcrumb = [
    { name:"Master Admin"},{ href:"/master-dashboard", name: "Dashboard" },{ name: "Hearing Summary List" },
  ];

  return (
    <>
      
      <Header />
      <div className="flex flex-col h-full">
        <AdminSidebarLayout breadcrumb={breadcrumb}>
        <AuthorizationWrapper
          authorizedUserTypes={[150]}
          redirectPath="/logout"
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
