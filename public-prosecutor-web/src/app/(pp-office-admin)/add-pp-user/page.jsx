"use client";

import React, { useState, useEffect } from "react";
import { addPPUser } from "@/app/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CustomAlertDialog } from "@/components/custom-alert-dialog";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { DatePicker } from "@/components/date-picker";
import { isValidIndianPhoneNumber, isValidEmail } from "@/utils/validation";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  FileText,
  Hash,
  MapPin,
  Bookmark,
  Book,
  Clock,
  Send,
  Copy,
  Image,
  Eye,
  EyeOff,
} from "lucide-react";
import { decrypt } from "@/utils/crypto";

const Page = () => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } =
    useAlertDialog();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [triggerAddCase, setTriggerAddCase] = useState(false);
  const [user, setUser] = useState(null);
  const encryptedUser = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const [formData, setFormData] = useState({
    Username: "",
    UserPassword: "",
    EntryUserID: "",
    FullName: "",
    ContractNo: "",
    Email: "",
    LicenseNumber: "",
  });

  const [formErrors, setFormErrors] = useState({
    FullName: "",
    ContractNo: "",
    Email: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser));
    setUser(decoded_user);
    setFormData((prevState) => ({
      ...prevState,
      EntryUserID: decoded_user.AuthorityUserID,
    }));
  }, [encryptedUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {
      FullName: "",
      ContractNo: "",
      Email: "",
    };

    if (!formData.FullName.trim()) {
      errors.FullName = "Full Name is required";
    }

    if (!formData.ContractNo.trim()) {
      errors.ContractNo = "Contact Number is required";
    } else if (!isValidIndianPhoneNumber(formData.ContractNo)) {
      errors.ContractNo = "Invalid Indian phone number";
    }

    if (!formData.Email.trim()) {
      errors.Email = "Email is required";
    } else if (!isValidEmail(formData.Email)) {
      errors.Email = "Invalid email address";
    }

    setFormErrors(errors);
    return Object.values(errors).every((error) => error === "");
  };

  const handleAddUser = () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    addPPUser(formData)
      .then(async (result) => {
        // console.log(result)
        openAlert(
          "success",
          `Head User Added Successfully!
            Username: ${formData.Username}
            Password: ${formData.UserPassword}`
        );
        setFormData({
          Username: "",
          UserPassword: "",
          EntryUserID: "",
          FullName: "",
          ContractNo: "",
          Email: "",
          LicenseNumber: "",
        });
      })
      .catch((err) => {
        // console.log(err)
        openAlert("error", err || "An unexpected error occurred");
        setError(err || "An unexpected error occurred");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleConfirm = () => {
    closeAlert();
  };

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <CustomAlertDialog
          isOpen={isOpen}
          alertType={alertType}
          alertMessage={alertMessage}
          onClose={closeAlert}
          onConfirm={handleConfirm}
        />

        <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4 overflow-hidden border-slate-500">
          <CardHeader className="mb-5 bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3">
            <CardTitle className="text-white text-xl">
              Add Public Prosecutor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="FullName">
                    Full Name
                  </Label>
                  <Input
                    //  icon={Hash}
                    icon={Hash}
                    id="FullName"
                    name="FullName"
                    placeholder="Enter full name"
                    value={formData.FullName}
                    onChange={handleChange}
                    required
                    maxLength={30}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="ContractNo">
                    Contact Number
                  </Label>
                  <Input
                    icon={Hash}
                    id="ContractNo"
                    name="ContractNo"
                    type="tel"
                    placeholder="Enter contact number"
                    value={formData.ContractNo}
                    onChange={handleChange}
                    required
                    maxLength={10}
                  />
                  {formErrors.ContractNo && (
                    <p className="text-sm text-red-500">
                      {formErrors.ContractNo}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="Username">
                    Username
                  </Label>
                  <Input
                    icon={Hash}
                    id="Username"
                    name="Username"
                    placeholder="Enter username"
                    value={formData.Username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="UserPassword">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      icon={Hash}
                      id="UserPassword"
                      name="UserPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={formData.UserPassword}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onMouseDown={() => setShowPassword(true)}
                      onMouseUp={() => setShowPassword(false)}
                      onMouseLeave={() => setShowPassword(false)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {/* <p className="text-sm text-gray-500">Use a strong, unique password</p> */}
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="Email">
                    Email
                  </Label>
                  <Input
                    icon={Hash}
                    id="Email"
                    name="Email"
                    type="email"
                    placeholder="Enter e-mail address"
                    value={formData.Email}
                    onChange={handleChange}
                    required
                    className={formErrors.Email ? "border-red-500" : ""}
                  />
                  {formErrors.Email && (
                    <p className="text-sm text-red-500">{formErrors.Email}</p>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="LicenseNumber">
                    License Number
                  </Label>
                  <Input
                    icon={Hash}
                    id="LicenseNumber"
                    name="LicenseNumber"
                    placeholder="Enter license number"
                    value={formData.LicenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <Button
                onClick={handleAddUser}
                className="max-w-min mx-auto mt-10 mb-5 bg-blue-500"
                disabled={
                  isLoading ||
                  Object.values(formErrors).some((error) => error !== "")
                }
              >
                {isLoading ? "Please Wait..." : "Add Public Prosecutor"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Page;
