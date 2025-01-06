import DashboardCards from "./dashboard-cards"

export default function DashboardPage() {
  return (
    (<div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PP Head Dashboard</h1>
      <DashboardCards />
    </div>)
  );
}

