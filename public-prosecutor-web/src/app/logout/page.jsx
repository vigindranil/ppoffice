"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { clearToken } from "@/redux/slices/authSlice";
import { useToast } from "@/hooks/use-toast";

const Logout = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleLogout = async () => {
      toast({
        title: "Logging Out",
        description: "See you next time!",
        duration: 2000,
      });

      // Clear the token
      dispatch(clearToken());

      // Redirect to the home page
      router.push("/");
    };

    handleLogout();
  }, [dispatch, router, toast]);

  return null; // No UI needed for this route
};

export default Logout;
