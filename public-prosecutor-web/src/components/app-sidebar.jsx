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
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
// import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
// Sample data
const data = {
  user: {
    name: "Super Admin",
    email: "admin@example.com",
    avatar: "/img/user.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
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
          title: "History",
          url: "/pending",
        },
        {
          title: "Future",
          url: "/pending",
        },
        {
          title: "Custom",
          url: "/pending",
        },
      ],
    },
    {
      title: "PP office admin",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      type: 10,
      items: [
        {
          title: "Dashboard",
          url: "#",
        },
        {
          title: "Add cases",
          url: "#",
        },
      ],
    },
    {
      title: "PP Head Operations",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      type: 20,
      items: [
        {
          title: "Dashboard",
          url: "/pp-head-dashboard",
        },
        {
          title: "Add PP User",
          url: "/add-pp-user",
        },
        {
          title: "PP Users",
          url: "/pp-users",
        },
        {
          title: "Assign Case",
          url: "/pp-head-pending-cases",
        }
      ],
    },
    {
      title: "SP Operations",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      type: 30,
      items: [
        {
          title: "Dashboard",
          url: "/sp-dashboard",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
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
      <SidebarHeader>{/* <TeamSwitcher teams={data.teams} /> */}</SidebarHeader>
      <SidebarContent className="flex-grow">
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
