'use client'

import React from "react";
import {sdkClient} from "@/lib";
import {AboutPage} from "@nlc-ai/web-shared";
import {useAuth} from "@nlc-ai/web-auth";
import {useSearchParams} from "next/navigation";
import {UserType} from "@nlc-ai/types";

const ClientAboutPage = () => {
  const { user } = useAuth();

  const params = useSearchParams();
  const userID = params.get('userID') as string;
  const userType = params.get('userType') as UserType;

  return (
    <AboutPage
      sdkClient={sdkClient}
      user={user}
      userID={userID}
      userType={userType}
    />
  );
};

export default ClientAboutPage;
