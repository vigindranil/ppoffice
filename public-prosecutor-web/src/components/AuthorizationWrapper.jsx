"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthorizationCheck } from "@/hooks/use-userAuthorization";

const AuthorizationWrapper = ({
  children,
  authorizedUserTypes,
  redirectPath,
}) => {
  const router = useRouter();
  const { user } = useAuthorizationCheck(
    authorizedUserTypes.map((id) => ({ authorityUserTypeID: id, redirectPath }))
  );

  useEffect(() => {
    if (user) {
      const isAuthorized = authorizedUserTypes.includes(
        user.AuthorityTypeID
      );
      if (!isAuthorized) {
        router.push("/unauthorized");
      }
    }
  }, [user, authorizedUserTypes, redirectPath, router]);

  if (!user) {
    return null; // or a loading indicator
  }

  return <>{children}</>;
};

export default AuthorizationWrapper;
