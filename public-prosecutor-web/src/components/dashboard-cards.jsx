import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Clock, CheckCircle, ArrowRight } from 'lucide-react'

const cardData = [
  {
    title: "Total Cases",
    subtitle: "All cases in the system",
    value: "36",
    icon: FileText,
    color: "#3b82f6", // blue-500
    link: "/pp-head-total-cases"
  },
  {
    title: "Pending Cases",
    subtitle: "Cases awaiting action",
    value: "8",
    icon: Clock,
    color: "#eab308", // yellow-500
    link: "/pp-head-pending-cases"
  },
  {
    title: "Assigned Cases",
    subtitle: "Cases currently in progress",
    value: "28",
    icon: CheckCircle,
    color: "#22c55e", // green-500
    link: "/pp-head-assigned-cases"
  }
]

export default function DashboardCards() {
  return (
    (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => (
        <Card
          key={index}
          className="relative shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4"
          style={{ borderLeftColor: card.color }}>
          <Link href={card.link} className="absolute inset-0 z-10">
            <span className="sr-only">View {card.title}</span>
          </Link>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4" style={{ color: card.color }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            <div className="flex items-center pt-4 group" style={{ color: card.color }}>
              <span className="text-sm">View details</span>
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>)
  );
}

