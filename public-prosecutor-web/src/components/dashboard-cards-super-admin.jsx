'use client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, ArrowRight, Users } from 'lucide-react'
import { decrypt } from '@/utils/crypto';
import { fetchSuperDashboardCount } from '@/app/api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const cardData = [

  {
    title: "Public Prosecutor Head",
    subtitle: "Total No. of Heads",
    value: "36",
    icon: Users,
    color: "#2563eb", // blue-600
    link: "/pp-head-list",
    type: "PPHead"
  },
  {
    title: "Office Admin",
    subtitle: "Total No. of Office Admins",
    value: "8",
    icon: Users,
    color: "#0ea5e9", // sky-500
    link: "/pp-office-admin-list",
    type: "PPofficeAdmin"
  },
  {
    title: "Superintendent of Police",
    subtitle: "Total No. SPs",
    value: "28",
    icon: Users,
    color: "#2563eb", // blue-600
    link: "/sp-list",
    type: "SPuser"
  }
]

export default function DashboardCards() {
  const [userCount, setUserCount] = useState(null);
  const userDetails = useSelector((state) => state.auth.user);
  const [user, setUser] = useState("");

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(userDetails));
    setUser(decoded_user);
  }, [userDetails]);

   useEffect(() => {
      if (user) {
        fetchSuperDashboardCount(user?.AuthorityUserID)
          .then((result) => {
            console.log(result);
            setUserCount(result)
          })
          .catch((err) => {
            console.error("Error fetching user count:", err);
            setUserCount({
              "PPofficeAdmin": 0,
              "PPHead": 0,
              "SPuser": 0,
              "PSuser": 0,
              "PPuser": 0
          })
          });
      }
    }, [user])
  return (
    (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {userCount && cardData.map((card, index) => (
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
            <div className="text-2xl font-bold">{userCount[`${card?.type}`] || 0}</div>
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

