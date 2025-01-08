"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Wifi, WifiOff, CircleArrowRight } from "lucide-react";
import Link from "next/link";
import DashboardCards from "./dashboard-cards";

export default function AdminDashboard() {
  return (
    <div className="relative min-h-screen w-full">
    <div 
      className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')] brightness-30"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
    <main className="relative z-10 p-6">

      <h1 className="text-2xl font-semibold mb-4 text-white">
        Welcome to your Super Administrator Dashboard
      </h1>
      
      <DashboardCards />
    </main>
    </div>
  );
}
