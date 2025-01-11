import React from "react";
import DashboardCards from "./dashboard-cards"

export default function OfficeAdminDashboard() {
  return (
  <div className="relative min-h-screen w-full">
    <div 
      className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')] brightness-30"
    />
    {/* <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div> */}
    <main className="relative z-10 p-6">

      <h1 className="text-2xl font-semibold mb-4 text-black">
        Welcome to Head Administrator Dashboard
      </h1>

      <DashboardCards />
      
      <div>
      </div>
    </main>
  </div>
  
  );
}
