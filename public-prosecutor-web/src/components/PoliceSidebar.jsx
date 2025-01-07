import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, LayoutDashboard, UserPlus, Users, FileCheck } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

function PoliceSidebar({ children }) {
  return React.createElement(
    "div",
    { className: "flex min-h-screen" },
    // Sidebar
    React.createElement(
      "div",
      { className: "w-64 border-r bg-background" },
      React.createElement(
        "div",
        { className: "flex h-16 items-center gap-2 px-4 border-b" },
        React.createElement("img", { src: "/emblem.png", alt: "Emblem", className: "h-8 w-8" }),
        React.createElement("h1", { className: "text-lg font-semibold" }, "Public Prosecutor Office Management")
      ),
      React.createElement(
        ScrollArea,
        { className: "h-[calc(100vh-4rem)]" },
        React.createElement(
          "div",
          { className: "flex flex-col gap-4 p-4" },
          React.createElement(
            "div",
            null,
            React.createElement(
              "h2",
              { className: "mb-2 text-lg font-semibold tracking-tight" },
              "Topic"
            ),
            React.createElement(
              "div",
              { className: "space-y-1" },
              React.createElement(
                Button,
                { variant: "ghost", className: "w-full justify-start gap-2" },
                React.createElement("span", null, "PP Head Operations"),
                React.createElement(ChevronDown, { className: "ml-auto h-4 w-4" })
              ),
              React.createElement(
                Button,
                { variant: "ghost", className: "w-full justify-start gap-2", asChild: true },
                React.createElement(
                  Link,
                  { href: "/dashboard" },
                  React.createElement(LayoutDashboard, { className: "h-4 w-4" }),
                  "Dashboard"
                )
              ),
              React.createElement(
                Button,
                { variant: "ghost", className: "w-full justify-start gap-2", asChild: true },
                React.createElement(
                  Link,
                  { href: "/add-user" },
                  React.createElement(UserPlus, { className: "h-4 w-4" }),
                  "Add PP User"
                )
              ),
              React.createElement(
                Button,
                { variant: "ghost", className: "w-full justify-start gap-2", asChild: true },
                React.createElement(
                  Link,
                  { href: "/users" },
                  React.createElement(Users, { className: "h-4 w-4" }),
                  "PP Users"
                )
              ),
              React.createElement(
                Button,
                { variant: "ghost", className: "w-full justify-start gap-2", asChild: true },
                React.createElement(
                  Link,
                  { href: "/assign-case" },
                  React.createElement(FileCheck, { className: "h-4 w-4" }),
                  "Assign Case"
                )
              )
            )
          )
        )
      )
    ),
    // Main content
    React.createElement(
      "div",
      { className: "flex-1" },
      React.createElement(
        "header",
        { className: "flex h-16 items-center justify-between border-b px-6" },
        React.createElement(
          "div",
          { className: "flex items-center gap-2" },
          "PP Head Admin",
          React.createElement("span", { className: "text-muted-foreground" }, "/"),
          "Dashboard"
        ),
        React.createElement(Button, { variant: "ghost" }, "Logout")
      ),
      React.createElement("main", { className: "p-6" }, children)
    )
  );
}

export default PoliceSidebar;
