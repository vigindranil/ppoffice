"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { use, useEffect, useState } from "react";
// import { fetchAdvocateData } from "./api";
import { BASE_URL } from "@/app/constants";

const AdvocatePage = ({ params }) => {
  const unwrappedParams = use(params);
  const { caseId } = unwrappedParams;
  const dec_caseId = decodeURIComponent(caseId);
  const case_id = atob(dec_caseId);
  const [advocateData, setAdvocateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    fetch(`${BASE_URL}advocates/${case_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 0 && Array.isArray(data.data)) {
          setAdvocateData(data.data);
        } else {
          setError(data.message || "Invalid response format");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, [case_id]);
  return (
    <div className="max-w-full p-8">
      <h1 className="text-2xl font-bold mb-4">Advocate Lists</h1>
      {advocateData && (
        <ol className="list-decimal pl-6 space-y-2">
          {advocateData.map((advocate, index) => (
            <li key={index}>
              <p>{advocate.advocateName}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default AdvocatePage;
