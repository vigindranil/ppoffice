"use client";

import React, { useEffect, useState } from "react";
import { addPsStaff, alldistrict, showpoliceBydistrict } from "@/app/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Lock, CircleUser, Phone, Mail, CreditCard } from "lucide-react";
import { useSelector } from "react-redux";
import { decrypt } from "@/utils/crypto";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { CustomAlertDialog } from "@/components/custom-alert-dialog";
import { useToast } from "@/hooks/use-toast";

const Page = () => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } =
    useAlertDialog();
  const userDetails = useSelector((state) => state.auth.user);
  const [user, setUser] = useState("");
  const [allDistrictList, setAllDistrictList] = useState(null);
  const [districtID, setDistrictID] = useState("");
  const [allPSList, setAllPSList] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(userDetails));
    setUser(decoded_user);
  }, [userDetails]);

  const [formData, setFormData] = useState({
    Username: "",
    UserPassword: "",
    EntryUserID: "",
    FullName: "",
    ContractNo: "",
    Email: "",
    LicenseNumber: "",
    PsID: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submitted with data:", formData);

    try {
      const result = await addPsStaff({
        ...formData,
        EntryUserID: user?.AuthorityUserID,
      });

      console.log("Result:", result);
      if (result.status === 0) {
        openAlert("success", result.message);
        setFormData({
          Username: "",
          UserPassword: "",
          EntryUserID: "",
          FullName: "",
          ContractNo: "",
          Email: "",
          LicenseNumber: "",
          PsID: "",
        });

        toast({
          title: "PS User Added",
          description: "PS User added successfully",
          variant: "success",
          duration: 2000,
        });
      } else {
        openAlert("error", result.message || "Failed to add ps user");

        toast({
          title: "Failed to Add User",
          description: "PS User could not be added",
          variant: "destructive",
          duration: 2000,
        });
      }
    } catch (error) {
      setMessage("Error adding PS User");
      console.error("Error adding PS User:", error);
      toast({
        title: "Failed to Add User",
        description: "PS User could not be added",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    user &&
      showpoliceBydistrict(user?.BoundaryID)
        .then((result) => {
          // console.log(user?.BoundaryID)
          setAllPSList(result);
        })
        .catch((err) => {
          // console.log(err);
        });
  }, [user]);

  return (
    <Card className="w-full max-w-md mx-auto h-full bg-white/30 backdrop-blur-sm my-4">
      <CustomAlertDialog
        isOpen={isOpen}
        alertType={alertType}
        alertMessage={alertMessage}
        onClose={closeAlert}
        onConfirm={() => {
          console.log("success!");
        }}
      />
      <CardHeader>
        <CardTitle>Add PS User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="FullName">Full Name</Label>
              <Input
                icon={CircleUser}
                id="FullName"
                name="FullName"
                placeholder="Enter your full name"
                value={formData.FullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="ContractNo">Contact Number</Label>
              <Input
                icon={Phone}
                id="ContractNo"
                name="ContractNo"
                type="tel"
                placeholder="Enter your contact number"
                value={formData.ContractNo}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="Username">Username</Label>
              <Input
                icon={User}
                id="Username"
                name="Username"
                placeholder="Enter your username"
                value={formData.Username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="UserPassword">Password</Label>
              <Input
                icon={Lock}
                id="UserPassword"
                name="UserPassword"
                type="password"
                placeholder="Enter your password"
                value={formData.UserPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="Email">Email</Label>
              <Input
                icon={Mail}
                id="Email"
                name="Email"
                type="email"
                placeholder="Enter your email address"
                value={formData.Email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="LicenseNumber">License Number</Label>
              <Input
                icon={CreditCard}
                id="LicenseNumber"
                name="LicenseNumber"
                placeholder="Enter your license number"
                value={formData.LicenseNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="PsID">Police Station</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, PsID: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Police Station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Police Stations</SelectLabel>
                    {allPSList?.map((ps) => (
                      <SelectItem key={ps.id} value={ps.id.toString()}>
                        {ps.ps_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            className="max-w-min mx-auto bg-blue-500 hover:bg-blue-600 my-5 mt-5"
          >
            Add PS User
          </Button>
        </form>
        {message && (
          <p className="mt-4 text-center text-red-600">
            {typeof message === "string" ? message : JSON.stringify(message)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Page;
