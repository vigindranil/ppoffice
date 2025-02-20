"use client";

import CaseTable from "@/components/total-cases-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Page = () => {
  return (
    <div className="container overflow-hidden mx-auto p-3">
      <Card className="overflow-hidden">
        <CardTitle className=" bg-green-600 p-4 text-2xl text-white font-bold mb-5">
          Total Cases
        </CardTitle>
        <CardContent>
          <CaseTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
