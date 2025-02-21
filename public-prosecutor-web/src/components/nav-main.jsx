"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSelector } from "react-redux";
import { decrypt } from "@/utils/crypto";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({ items }) {
  const encryptedUser = useSelector((state) => state.auth.user);
  const [userType, setUserType] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    if (encryptedUser) {
      try {
        const decryptedUser = JSON.parse(decrypt(encryptedUser));
        setUserType(parseInt(decryptedUser.AuthorityTypeID));
      } catch (error) {
        console.error("Error decrypting user data:", error);
      }
    }
  }, [encryptedUser]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(
          (item) =>
            item.type === userType && (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              className={`${
                                pathname == subItem?.url
                                  ? "bg-gray-200 font-semibold"
                                  : ""
                              }`}
                              href={subItem.url}
                            >
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
