"use client";
import React, { Suspense, useEffect, useState } from "react";
import Loading from "./loading";
import AdminSidebarLayout from "@/components/sidebar-layout";
import { useSelector } from "react-redux";
import Footer from '@/components/Footer';
import Header from "@/components/Header";

const Layout = ({children}) => {
  const [authToken, setAuthToken] = useState("");
  const [user, setUser] = useState("");
  const token = useSelector((state) => state.auth.token);
  const userDetails = useSelector((state) => state.auth.user);

  useEffect(() => {
    setAuthToken(token);
    setUser(userDetails);
  }, [token, userDetails]); 

  const breadcrumb = [
    { name: "Super Admin" }, { name: "Dashboard" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <AdminSidebarLayout breadcrumb={breadcrumb}>
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
