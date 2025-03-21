import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle } from 'lucide-react'
import Link from "next/link"


export default function Page() {
  return (

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Ps Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Cases Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">36</div>
              <p className="text-xs text-muted-foreground">
                All cases in the system
              </p>
              <Link
                href="/ps-case"
                className="text-sm text-blue-500 hover:underline mt-2 inline-block"
              >
                View details →
              </Link>
            </CardContent>
          </Card>

          {/* Pending Cases Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pending Cases</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Cases awaiting action
              </p>
              <Link
                href="/pending-cases"
                className="text-sm text-yellow-500 hover:underline mt-2 inline-block"
              >
                View details →
              </Link>
            </CardContent>
          </Card>

          {/* Assigned Cases Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Assigned Cases</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">
                Cases currently in progress
              </p>
              <Link
                href="/assigned-cases"
                className="text-sm text-green-500 hover:underline mt-2 inline-block"
              >
                View details →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

  )
}


