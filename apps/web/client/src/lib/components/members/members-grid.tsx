import {MemberCard} from "@/lib";

export const MembersGrid = ({ members }: any) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      {members.map((member: any) => (
        <MemberCard key={member.memberID} member={member} />
      ))}
    </div>
  );
};
