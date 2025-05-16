"use client";

import React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  CheckCheck,
  Command,
  FolderOpen,
  FolderPlus,
  FolderSearch,
  Frame,
  GalleryVerticalEnd,
  List,
  Map,
  Menu,
  PieChart,
  Settings2,
  ShieldPlus,
  SquareTerminal,
  UserPlus,
  UserSearch,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSelector } from "react-redux";
import {  useEffect, useState } from "react";

const data = {
  user: {
    name: "USER",
    email: "user@example.com",
    avatar: "/img/user.jpg",
  },
  navMain: [
   
    {
      title: "Navigation",
      url: "#",
      icon: Menu,
      isActive: true,
      type: 20,
      items: [
        {
          title: "Dashboard",
          url: "/pp-head-dashboard",
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: FolderSearch,
      isActive: true,
      type: 20,
      items: [
        {
          title: "All Cases",
          url: "/pp-head-total-cases",
        },
        {
          title: "Assigned Cases",
          url: "/pp-head-assigned-cases",
        },
        {
          title: "Pending Cases",
          url: "/pp-head-pending-cases",
        },
      ],
    },
    {
      title: "Navigation",
      url: "#",
      icon: Menu,
      isActive: true,
      type: 30,
      items: [
        {
          title: "Dashboard",
          url: "/sp-dashboard",
        },
        {
          title: "Notifications",
          url: "/sp-notifications",
        },
        {
          title: "Add PS User",
          url: "/add-ps",
        },
      ],
    },
    {
      title: "Navigation",
      url: "#",
      icon: Menu,
      isActive: true,
      type: 70,
      items: [
        {
          title: "Dashboard",
          url: "/ro-dashboard",
        },
        {
          title: "Add PS User",
          url: "/ro-add-ps-user",
        },
      ],
    },
    {
      title: "Navigation",
      url: "#",
      icon: Menu,
      isActive: true,
      type: 150,
      items: [
        {
          title: "Dashboard",
          url: "/master-dashboard",
        },
      ],
    },
    {
      title: "Navigation",
      url: "#",
      icon: Menu,
      isActive: true,
      type: 50,
      items: [
        {
          title: "Dashboard",
          url: "/ps-case",
        },
        {
          title: "My Profile",
          url: "/ps-profile",
        },{
          title:"Notifications",
          url:"/ps-emails-details",
        }
      ],
    },
    {
      title: "Navigation",
      url: "#",
      icon: Menu,
      isActive: true,
      type: 100,
      items: [
        {
          title: "Dashboard",
          url: "/super-admin-dashboard",
        },
      ],
    },
    {
      title: "Show User List",
      url: "#",
      icon: UserSearch,
      isActive: true,
      type: 100,
      items: [
        {
          title: "Public Prosecutor Head",
          url: "/pp-head-list",
        },
        {
          title: "Office Admin",
          url: "/pp-office-admin-list",
        },
        {
          title: "Superintendent of Police",
          url: "/sp-list",
        },
      ],
    },
    {
      title: "Add User",
      url: "#",
      icon: UserPlus,
      isActive: true,
      type: 100,
      items: [
        {
          title: "Public Prosecutor Head",
          url: "/add-pp-head",
        },
        {
          title: "Office Admin",
          url: "/add-pp-office-admin",
        },
        {
          title: "Superintendent of Police",
          url: "/add-sp",
        },
      ],
    },
    {
      title: "Navigation",
      url: "#",
      icon: Menu,
      isActive: true,
      type: 60,
      items: [
        {
          title: "Dashboard",
          url: "/public-prosecutor-user-dashboard",
        },
      ],
    },
    {
      title: "Show Detailed Report",
      url: "#",
      icon: FolderOpen,
      isActive: true,
      type: 60,
      items: [
        {
          title: "My Cases",
          url: "/show-public-prosecutor-case-details",
        },
      ],
    },
    {
      title: "Navigation",
      url: "#",
      icon: Menu,
      isActive: true,
      type: 10,
      items: [
        {
          title: "Dashboard",
          url: "/pp-office-admin-dashboard",
        },
      ],
    },
    {
      title: "Actions",
      url: "#",
      icon: FolderPlus,
      isActive: true,
      type: 10,
      items: [
        {
          title: "Add/Edit Case & CRAN",
          url: "/pp-office-admin-add-case",
        },
        // {
        //   title: "Add CRR",
        //   url: "/add-crr",
        // },
        // {
        //   title: "Add CRAN",
        //   url: "/add-cran",
        // },
        {
          title: "Add New Advocate",
          url: "/add-pp-user",
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: FolderSearch,
      isActive: true,
      type: 10,
      items: [
        {
          title: "Assigned Cases",
          url: "/pp-office-admin-assigned-cases",
        },
        {
          title: "Unassigned Cases",
          url: "/pp-office-admin-unassigned-cases",
        },
        {
          title: "All Cases",
          url: "/pp-office-admin-all-cases",
        },
      ],
    },
    {
      title: "Lists",
      url: "#",
      icon: List,
      isActive: true,
      type: 10,
      items: [
        {
          title: "Advocate List",
          url: "/pp-users",
        },
        {
          title: "Search",
          url: "/pp-office-section-search",
        },
      ],
    },
  ],
};

export const AdminAppSidebar = (props) => {
  const [authToken, setAuthToken] = useState("");
  const [user, setUser] = useState("");
  const token = useSelector((state) => state.auth.token);
  const userDetails = useSelector((state) => state.auth.user);

  useEffect(() => {
    setAuthToken(token);
    setUser(userDetails);
  }, [token, userDetails]);
  // console.log(user);
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="mt-[64px] flex flex-col h-[calc(100vh-64px)] z-20"
    >
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );

};
