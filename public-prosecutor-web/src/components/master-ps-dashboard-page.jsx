import DashboardCards from "./master-ps-dashboard-cards"

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash1.jpg')] brightness-30" />
      <main className="relative z-10 p-6">
        <h1 className="text-2xl font-semibold mb-8 text-white">
          District-wise PS
        </h1>
        <DashboardCards/>
      </main>
    </div>
  );
}


