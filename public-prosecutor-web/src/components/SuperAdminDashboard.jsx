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

export default function AdminDashboard() {
  return (
    <main
      className="flex-1 p-6 relative w-full bg-cover bg-center h-screen"
      style={{ backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url('img/dash2.jpg')" }} 
    >

      {/* Overlay for Background Image */}
      <div className="absolute inset-0 bg-black bg-opacity-40 -z-10"></div>

      <h1 className="text-2xl font-semibold mb-4 text-white">
        Welcome to your Dashboard
      </h1>
      
      <div>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <Card className="bg-white bg-opacity-70 backdrop-blur-sm shadow-lg border-l-yellow-300 border-l-4">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-slate-600">
                Generated Mutations
              </CardTitle>
              <AlertCircle className="w-8 h-8 ml-auto text-yellow-500" />
            </CardHeader>
            <CardContent>
              <h1 className="text-5xl font-medium text-slate-800">11</h1>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="bg-stone-100">
                <Link href="/dl-suspensions">
                  show more
                  <CircleArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white bg-opacity-70 backdrop-blur-sm shadow-lg border-l-emerald-300 border-l-4">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-slate-600">
                Downloaded Mutations
              </CardTitle>
              <CheckCircle2 className="w-8 h-8 ml-auto text-emerald-500" />
            </CardHeader>
            <CardContent>
              <h1 className="text-5xl text-slate-800">33</h1>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="bg-stone-100">
                <Link href="/dl-suspensions">
                  show more
                  <CircleArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div> */}

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
          <Card className="bg-white bg-opacity-70 backdrop-blur-sm shadow-lg border-l-sky-300 border-l-4">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-slate-600">
                Online Mutations
              </CardTitle>
              <Wifi className="w-8 h-8 ml-auto text-blue-500" />
            </CardHeader>
            <CardContent>
              <h1 className="text-5xl text-slate-800">11</h1>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="bg-stone-100">
                <Link href="/dl-suspensions">
                  show more
                  <CircleArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white bg-opacity-70 backdrop-blur-sm shadow-lg border-l-rose-300 border-l-4">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-slate-600">
                Offline Mutations
              </CardTitle>
              <WifiOff className="w-8 h-8 ml-auto text-red-400" />
            </CardHeader>
            <CardContent>
              <h1 className="text-5xl text-slate-800">22</h1>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="bg-stone-100">
                <Link href="/dl-suspensions">
                  show more
                  <CircleArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div> */}
      </div>
    </main>
  );
}
