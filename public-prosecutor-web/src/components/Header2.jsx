"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Creepster, Kanit } from 'next/font/google'

const creep = Creepster({
  weight: ['400'],
  style: ['normal'],
  subsets: ['latin']
})

const kanit = Kanit({
  weight: ['400'],
  style: ['normal'],
  subsets: ['latin']
})

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-yellow-500/80 backdrop-blur-md border-b">
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
            <span className={`text-xl font-semibold text-zinc-900 ${kanit.className}`}>
            {/* <span className="text-xl font-semibold text-zinc-900"> */}
            Public Prosecutor Office Management
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
