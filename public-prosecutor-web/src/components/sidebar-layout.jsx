import { AdminAppSidebar } from "@/components/app-sidebar";
import LogoutButton from "@/components/Logout";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export default function AdminSidebarLayout({
  breadcrumb = [{ href: "#", name: "User" }],
  children,
}) {
  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AdminAppSidebar />
      </div>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumb.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem
                      className={`hidden md:block ${
                        index == breadcrumb.length - 1 && "text-primary"
                      }`}
                    >
                      <BreadcrumbLink href={item.href}>
                        {item.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index !== breadcrumb.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* <div className="flex items-center mr-5">
            <LogoutButton />
          </div> */}
        </header>
        <div>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
