'use client'

import React from "react";
import {StandaloneChat} from "@nlc-ai/web-shared";

export default function ChatPage({ params }: { params: { coachID: string } }) {
  return <StandaloneChat coachID={params.coachID} />;
}
