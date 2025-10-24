'use client'

import {CalendarPage} from "@nlc-ai/web-shared";
import {sdkClient} from "@/lib";
import {UserType} from "@nlc-ai/types";

const AdminCalendarPage = () => {
  return (<CalendarPage userType={UserType.ADMIN} sdkClient={sdkClient}/>);
}

export default AdminCalendarPage;
