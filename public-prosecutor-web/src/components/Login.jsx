"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { setToken, setUser } from "@/redux/slices/authSlice";
import { useDispatch } from "react-redux";
import {BASE_URL} from '@/app/constants';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${BASE_URL}authenticate`,
        {
          username: formData.username,
          password: formData.password,
        }
      );

      if (
        response.data.status === 0 &&
        response.data.message === "Data found"
      ) {
        const userData = response.data;
        localStorage.setItem('authToken', response.data.access_token);
        dispatch(setToken(userData?.access_token));
        dispatch(setUser(JSON.stringify(userData?.data[0])));
        // console.log((userData?.data[0].AuthorityTypeID));
        

        switch (parseInt(userData?.data[0].AuthorityTypeID)) {
          case 20:
            router.push("/pp-head-dashboard");
            break;
          case 10:
            router.push("/pp-office-admin-dashboard");
            break;
          case 30:
            router.push("/sp-dashboard");
            break;
          case 40:
            router.push("/dd-dashboard");
            break;
          case 50:
            router.push("/ps-case");
            break;
          case 53:
            router.push("/district-dd-dashboard");
            break;
          case 55:
            router.push("/district-stf-dashboard");
            break;
          case 60:
            router.push("/public-prosecutor-user-dashboard");
            break;
          case 80:
            router.push("/stf-dashboard");
            break;
          case 90:
            router.push("/cid-dashboard");
            break;
          case 100:
            router.push("/super-admin-dashboard");
            break;
          default:
            // console.log("Unknown AuthorityTypeID:", userData.AuthorityTypeID);
            router.push("/login");
        }
      } else if (response.data.status === 0 && response.data.message === "Invalid credentials provided") {
        setErrorMessage(response.data.message || "Invalid credentials. Please try again.");
      } 
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  return (
    <div className="relative bg-cover bg-center bg-[url('/img/ppoimage.jpg?height=1080&width=1920')]">
      {/* Gradient and Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 text-red-500 text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
              />

              <div className="relative">
                <Input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
