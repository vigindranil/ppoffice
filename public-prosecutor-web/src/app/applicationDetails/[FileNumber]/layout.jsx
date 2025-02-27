import React, { Suspense } from "react";
import Page from "./page";
import Loading from "./loading";
import SidebarLayout from "@/components/sidebar-layout";
import Cookies from 'react-cookies'

const layout = async ({ params }) => {
    const { FileNumber } = await params;
    const type = Cookies.load('type');

    const breadcrumb = [
        { href: type == 10 ? "/dashboard" : type == 40 ? "/dashboard-eo" : type == 30 ? "/dashboard-oc" : type == 20 ? "/dashboard-sp" : type == 50 ? "/dashboard-se" : "#", name: "Dashboard" },
        { href: "#", name: "Application Details" },
    ];

    return (
        <SidebarLayout breadcrumb={breadcrumb}>
            <Suspense fallback={<Loading />}>
                <Page FileNumber={FileNumber} />
            </Suspense>
        </SidebarLayout>
    )
}

export default layout
