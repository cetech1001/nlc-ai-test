'use client'
import { useRouter } from 'next/navigation';
import {NotificationsPage} from '@nlc-ai/web-shared';
import { sdkClient } from '@/lib/sdk-client';


const CoachNotificationsPage = () => {
  const router = useRouter();

  const goToActionUrl = (url: string) => {
    router.push(url);
  }

  const goBack = () => {
    router.back();
  }

  return (
    <NotificationsPage sdkClient={sdkClient} goToActionUrl={goToActionUrl} goBack={goBack}/>
  );
};

export default CoachNotificationsPage;
