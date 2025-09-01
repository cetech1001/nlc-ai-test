import {FC} from "react";

export const EmailAgentIcon: FC<{
  className: string;
}> = ({ className = "h-5 w-5" }) => {
  return (
    <img src={"/images/icons/sidebar/email-agent.svg"} className={className} alt={"Email Agent Icon"}/>
  );
}
