'use client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { decrypt } from '@/utils/crypto';
import { fetchDashboardCount } from '@/app/api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const cardData = [

  {
    title: "Total Cases",
    subtitle: "All cases in the system",
    value: "36",
    icon: FileText,
    color: "#3b82f6", // blue-500
    link: "/pp-head-total-cases",
    type: "totalCases"
  },
  {
    title: "Pending Cases",
    subtitle: "Cases awaiting action",
    value: "8",
    icon: Clock,
    color: "#eab308", // yellow-500
    link: "/pp-head-total-cases",
    type: "unassignedCases"
  },
  {
    title: "Assigned Cases",
    subtitle: "Cases currently in progress",
    value: "28",
    icon: CheckCircle,
    color: "#22c55e", // green-500
    link: "/pp-head-total-cases",
    type: "assignedCases"
  }
]

export default function DashboardCards() {
  const [caseCount, setCaseCount] = useState(null);
  const userDetails = useSelector((state) => state.auth.user);
  const [user, setUser] = useState("");

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(userDetails));
    setUser(decoded_user);
    console.log(decoded_user);
  }, [userDetails]);

   useEffect(() => {
      if (user) {
        fetchDashboardCount(user?.AuthorityUserID)
          .then((result) => {
            // console.log(result);
            setCaseCount(result)
          })
          .catch((err) => {
            console.error("Error fetching case count:", err);
            setCaseCount({
              "unassignedCases": 0,
              "assignedCases": 0,
              "totalCases": 0
          })
          });
      }
    }, [user])
  return (
    (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {caseCount && cardData.map((card, index) => (
        <Card
          key={index}
          className="relative shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4"
          style={{ borderLeftColor: card.color }}>
          <Link href={card.link} className="absolute inset-0 z-10">
            <span className="sr-only">View {card.title}</span>
          </Link>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">{card.title}</CardTitle>
            <card.icon className="h-4 w-4" style={{ color: card.color }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caseCount[`${card?.type}`] || 0}</div>
            <p className="text-xs text-bold-foreground mt-1">{card.subtitle}</p>
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

