import { BASE_URL } from "@/app/constants";

export async function fetchAdvocateData(caseId) {
  // Retrieve the token from session storage
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}advocates/${caseId}`, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch advocate data");
  }

  return res.json(); // returns { status, message, data: [...] }
}
