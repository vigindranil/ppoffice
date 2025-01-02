"use client";

import React from "react";
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
import { useEffect, useState } from "react";
import { decrypt } from "@/utils/crypto";

export function NavMain({ items }) {
  const userDetails = useSelector((state) => state.auth.user);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const parse_data = JSON.parse(decrypt(userDetails));
      setUser(parse_data);
    } catch (error) {
      console.error("Error parsing user details:", error);
      setUser({});
    }
  }, []);
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Topic</SidebarGroupLabel>
      <SidebarMenu>
      {items.map(
          (item) =>
            item.type == user?.AuthorityTypeID && (
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
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
