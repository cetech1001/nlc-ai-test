'use client'

import {useState} from "react";
import {CommunityHero, MembersGrid, MembersTabNav} from "@/lib";

const MembersPage = () => {
  const community = {
    name: "BNB BOSS Academy",
    url: "skool.com/bnb-boss-acadamy-1078",
    description: "This community is where we discuss all things Airbnb. Through our 9 years of experience & earnings 100K/months we are here to help you be successful!",
    image: "https://api.builder.io/api/v1/image/assets/TEMP/857f11ce371ffecc644087ea25e11dbee5582f39?width=620",
    stats: {
      members: 14,
      online: 0,
      admins: 7
    }
  };

  const members = [
    {
      memberID: 1,
      name: "Andrew Kramer",
      username: "@andrew-kramer-0210",
      joinDate: "Joined Jun 18",
      status: "online",
      avatar: "https://api.builder.io/api/v1/image/assets/TEMP/64460e4eaeebfbd454f2451244d3966c342a3c30?width=152",
      bio: "Hey all I am mum of two who just started digital marketing to try my luck"
    },
    {
      memberID: 2,
      name: "Sana Knokhar",
      username: "@sana-khokhar-6351",
      joinDate: "Joined Jun 18",
      status: "offline",
      avatar: "https://api.builder.io/api/v1/image/assets/TEMP/5e1aa500a01e821973f0afeba4512f45e496b429?width=152",
      bio: "Empowering aspiring entrepreneurs to escape the 9-5 grind, achieve financial freedom, and prioritise mental health 🌟 Digital Marketing + Support"
    },
    {
      memberID: 3,
      name: "Andrew Kramer",
      username: "@andrew-kramer-0210",
      joinDate: "Joined Jun 18",
      status: "online",
      avatar: "https://api.builder.io/api/v1/image/assets/TEMP/64460e4eaeebfbd454f2451244d3966c342a3c30?width=152",
      bio: "Hey all I am mum of two who just started digital marketing to try my luck"
    },
    {
      memberID: 4,
      name: "Sana Knokhar",
      username: "@sana-khokhar-6351",
      joinDate: "Joined Jun 18",
      status: "offline",
      avatar: "https://api.builder.io/api/v1/image/assets/TEMP/3dfa5255be5346ff47ddb7e60119da75b29366c2?width=152",
      bio: "Empowering aspiring entrepreneurs to escape the 9-5 grind, achieve financial freedom, and prioritise mental health 🌟 Digital Marketing + Support"
    }
  ];

  const [activeTab, setActiveTab] = useState('members');

  const tabStats = {
    members: '55 333',
    admins: '23',
    online: '142'
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1573px] mx-auto space-y-8 sm:space-y-10">
      <CommunityHero community={community} />

      <div className="space-y-6">
        <MembersTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={tabStats}
        />
        <MembersGrid members={members} />
      </div>
    </div>
  );
};

export default MembersPage;
