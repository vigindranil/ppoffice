import DashboardCards from "./master-dashboard-cards"

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen w-full">
    <div 
      className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash1.jpg')] brightness-30"
    />
    {/* <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div> */}
    <main className="relative z-10 p-6">
      <h1 className="text-2xl font-semibold mb-8 text-white">
        Master Admin Dashboard
      </h1>
      <DashboardCards />
      </main>
      </div>
  );
}

