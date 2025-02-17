"use client";
import { useRouter } from "next/navigation";
// import { signOut } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";

const LogoutButton = () => {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    // Clear authentication tokens from client-side (if not using NextAuth)
    // localStorage.removeItem('auth_token');
    // sessionStorage.removeItem('auth_token');

    // Or use NextAuth's signOut if using NextAuth.js
    // await signOut({
    //   redirect: false,  // prevents automatic redirect from NextAuth
    // });

    // Optional: Make an API call to log out from the server-side session
    // await fetch('/api/logout', { method: 'POST' });

    // Redirect user to the login page after logging out
    toast({
      title: "Logging Out",
      description: "Redirecting to logout page...",
      duration: 1500,
    });
    setTimeout(() => {
      router.push("/logout");
    }, 1000);
  };

  return (
    <button
      onClick={handleLogout}
      className="cursor-pointer bg-grey-500 text-black py-2 px-4 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
