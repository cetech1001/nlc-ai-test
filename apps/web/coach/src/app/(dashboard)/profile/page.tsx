'use client'

import {useSearchParams} from "next/navigation";
import {useAuth} from "@nlc-ai/web-auth";
import {UserType} from "@nlc-ai/types";
import {sdkClient} from "@/lib";
import {AboutPage} from "@nlc-ai/web-shared";

const ProfilePage = () => {
  const { user } = useAuth();

  const params = useSearchParams();
  const userID = params.get('userID') as string;
  const userType = params.get('userType') as UserType;

  return (
    <div className={"px-4"}>
      <AboutPage sdkClient={sdkClient} userID={userID} userType={userType || user?.type} user={user}/>
    </div>
  );
}

export default ProfilePage;
