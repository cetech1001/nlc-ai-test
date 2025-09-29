'use client';

import {appConfig} from "@nlc-ai/web-shared";
import {ClientsPage} from "@/app/(dashboard)/clients/details";
import {ClientsLandingPage} from "@/app/(dashboard)/clients/landing";

const Clients = () => {
  if (appConfig.features.enableLanding) {
    return <ClientsLandingPage/>
  }
  return <ClientsPage/>;
}

export default Clients;
