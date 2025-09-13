'use client'

import React from "react";
import {AboutDetailSection, AboutHeroSection} from "@/lib";

const AboutPage = () => {
  const community = {
    aboutID: 1,
    name: "BNB BOSS Academy",
    url: "skool.com/bnb-boss-acadamy-1078",
    description: "This community is where we discuss all things Airbnb. Through our 9 years of experience & earnings 100K/months we are here to help you be successful!",
    pricing: 5,
    heroImage: "https://api.builder.io/api/v1/image/assets/TEMP/febe83fa0e086fb3b380d7aa3ee988dee70f96bb?width=854",
    mainImage: "https://api.builder.io/api/v1/image/assets/TEMP/c78e53a5c6adbf0d63cf53654d7d68ac7602034f?width=2030",
    previewImage: "https://api.builder.io/api/v1/image/assets/TEMP/c43d1e25e5a75c57a452957772f4c2d2e22bd9af?width=334",
    stats: {
      members: 14,
      online: 0,
      admins: 7
    },
    features: [
      {
        type: 'icon',
        iconPath: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
        text: "Private"
      },
      {
        type: 'icon',
        iconPath: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
        text: "14 Members"
      },
      {
        type: 'icon',
        iconPath: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
        text: "$5/month"
      },
      {
        type: 'avatar',
        avatar: "https://api.builder.io/api/v1/image/assets/TEMP/db076468c8699694b92f4426fbc0f68d3c11921a?width=48",
        altText: "Sara Shelipko",
        text: "by Sara Shelipko"
      }
    ],
    detailedDescription: {
      intro: "Inside the BNB Boss Community, you'll access the latest information on Airbnb and learn from Airbnb experts Samantha & Brett on how they built a 7 figure business without even having to own any real estate.",
      benefits: [
        "🏠 Unlock how to choose the right locations that work!",
        "💸 How Airbnb can help generate a steady cash flow each month",
        "📝 The latest info on Airbnb as it is constantly changing for both the hosts and guests"
      ],
      conclusion: "This is your opportunity to learn a business that you can operate any time of day, no matter where in the world you are located. Get your time back and start living a life on your own terms."
    }
  };

  const handleJoinClick = () => {
    console.log('Join clicked');
    // Handle join logic here
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* About Hero Section */}
      <AboutHeroSection
        community={community}
        onJoinClick={handleJoinClick}
      />

      {/* About Detail Section */}
      <AboutDetailSection community={community} />
    </div>
  );
};

export default AboutPage;
