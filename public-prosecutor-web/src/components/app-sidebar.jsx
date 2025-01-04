"use client";

import React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
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
      title: "Add User",
      url: "#",
      icon: SquareTerminal,
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
      title: "Show User List",
      url: "#",
      icon: SquareTerminal,
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
      title: "Show Detailed Report",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      type: 60,
      items: [
        {
          title: "Cases",
          url: "/show-public-prosecutor-case-details",
        },
        // {
        //   title: "2",
        //   url: "/",
        // },
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
  console.log(user);
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
