import React, { Suspense } from "react";
import Loading from "./loading";
import AdminSidebarLayout from "@/components/sidebar-layout";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Page from "./page";

const Layout = async () => {

  const breadcrumb = [
    { href: "#", name: "SP Admin" },
    { href: "#", name: "Notifications" }
  ];

  return (
    <>
      <Header />

      {/* Main Content */}
      <div className="flex flex-col h-full">
        <AdminSidebarLayout breadcrumb={breadcrumb}>
          <div className="flex flex-1">
            <Suspense fallback={<Loading />}><Page /></Suspense>
          </div>
        </AdminSidebarLayout>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
