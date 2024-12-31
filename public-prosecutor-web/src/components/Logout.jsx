"use client";
import { useRouter } from 'next/navigation';
// import { signOut } from 'next-auth/react';

const LogoutButton = () => {
  const router = useRouter();

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
    router.push('/login');
  };

  return (
    <button 
        onClick={handleLogout} 
        className="cursor-pointer bg-grey-500 text-black py-2 px-4 rounded hover:bg-red-600">
        Logout
    </button>
    );
};

export default LogoutButton;
