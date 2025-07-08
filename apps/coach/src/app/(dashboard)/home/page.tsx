import { useAuth } from "@nlc-ai/auth";
import {USER_TYPE} from "@nlc-ai/types";

const CoachHomePage = () => {
  const { user } = useAuth(USER_TYPE.coach);

  return (
    <div>Hello {user?.firstName}!</div>
  );
}

export default CoachHomePage;
