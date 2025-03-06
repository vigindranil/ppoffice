"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loading from "./loading";
import AdminSidebarLayout from "@/components/sidebar-layout";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Page from "./page";
import { useSelector } from "react-redux";
import { decrypt } from "@/utils/crypto";

const Layout = () => {
  const [user, setUser] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const userDetails = useSelector((state) => state.auth.user);
  const { ps } = useParams();

  useEffect(() => {
    if (userDetails) {
      const decryptedUser = JSON.parse(decrypt(userDetails));
      setUser(decryptedUser);
    }
  }, [userDetails]);

  // const type = user?.data?.length > 0 ? user.data[0].AuthorityTypeID : null;

  const breadcrumb = [
    { name: "Master Admin" },
    { href: "/master-dashboard", name: "Dashboard" },
    { name: "PS wise Cases" }
  ];

  return (
    <>
      <Header />

      {/* Main Content */}
      <div className="flex flex-col h-full">
        <AdminSidebarLayout breadcrumb={breadcrumb}>
          <div className="flex flex-1">
            <Suspense fallback={<Loading />}>
              <Page ps={ps} />
            </Suspense>
          </div>
        </AdminSidebarLayout>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
