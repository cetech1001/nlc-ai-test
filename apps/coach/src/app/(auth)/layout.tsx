'use client';

import {ReactNode} from "react";
import { AuthLayout } from '@nlc-ai/auth';

export default function CoachAuthLayout({ children }: {
  children: ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
