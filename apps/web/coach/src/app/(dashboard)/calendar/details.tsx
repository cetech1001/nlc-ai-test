import {CalendarPage} from "@nlc-ai/web-shared";
import {sdkClient} from "@/lib";

const CalendarDetailsPage = () => {
  return (
    <CalendarPage sdkClient={sdkClient}/>
  );
}

export default CalendarDetailsPage;
