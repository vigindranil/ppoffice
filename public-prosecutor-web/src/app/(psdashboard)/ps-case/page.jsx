import React from "react";
import CaseTable from "@/components/ps-cases-table";
const page = () => {
  return (
    <div className="container mx-auto py-10 px-3">
      <h1 className="text-3xl font-bold mb-5">PS wise cases</h1>
      <CaseTable />
    </div>
  );
};

export default page;
