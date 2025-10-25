'use client'

import {CalendarPage} from "@nlc-ai/web-shared";
import {sdkClient} from "@/lib";

const AdminCalendarPage = () => {
  return (<CalendarPage sdkClient={sdkClient}/>);
}

export default AdminCalendarPage;
