"use client";

import React, { useEffect, useState } from "react";
import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { decrypt } from "@/utils/crypto";
import { useToast } from "@/hooks/use-toast";

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const encryptedUser = useSelector((state) => state.auth.user);
  const [user, setUser] = useState({ name: "", email: "", org: "" });
  const { toast } = useToast();

  useEffect(() => {
    if (encryptedUser) {
      try {
        const decryptedUser = JSON.parse(decrypt(encryptedUser));
        setUser({
          name: decryptedUser.AuthorityName || "User",
          email: decryptedUser.EmailID || "No email provided",
          org: decryptedUser.BoundaryName || "No Organisation provided",
        });
      } catch (error) {
        console.error("Error decrypting user data:", error);
      }
    }
  }, [encryptedUser]);

  const handleLogout = async () => {
    router.push("/logout");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="/img/user.png" alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
                <span className="truncate text-xs">{user.org}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="/img/user.jpg" alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                  <span className="truncate text-xs">{user.org}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
