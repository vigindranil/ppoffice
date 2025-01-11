"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { clearToken } from "@/redux/slices/authSlice";

const Logout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    // Clear the token
    dispatch(clearToken());

    // Redirect to the home page
    router.push("/");
  }, [dispatch, router]);

  return null; // No UI needed for this route
};

export default Logout;
