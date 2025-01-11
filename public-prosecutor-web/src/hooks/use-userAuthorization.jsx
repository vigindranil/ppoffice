"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { decrypt } from "@/utils/crypto";

export function useAuthorizationCheck(rules) {
  const router = useRouter();
  const userDetails = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const user_data = JSON.parse(decrypt(userDetails));
    checkAuthorization(user_data?.AuthorityTypeID || null, token);
  }, [userDetails]);

  function checkAuthorization(id = null, token) {
    const matchingRule = rules.find((rule) => rule.authorityUserTypeID === id);
    if (!matchingRule) {
      // If no matching rule is found, redirect to the first rule's redirectPath
      router.push(rules[0].redirectPath);
    }
    if (!token) {
      router.push("/unauthorized");
    }
    if (!id) {
      router.push("/unauthorized");
    }
  }

  return {
    user: userDetails ? JSON.parse(decrypt(userDetails)) : null,
  };
}
