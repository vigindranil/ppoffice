"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import LogoutButton from "@/components/Logout";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* <Link href="/" className="flex items-center gap-2"> */}
          <div className="flex items-center gap-2">
            <Image
              src="/img/file.png"
              alt="Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-semibold text-zinc-900">
            Public Prosecutor Office Management
            </span>
          </div>
          {/* </Link> */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <LogoutButton />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
