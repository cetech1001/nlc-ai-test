'use client'

import {CommunityHero, DiscussionSection} from "@/lib";

const CommunityPage = () => {
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

  const userAvatar = "https://api.builder.io/api/v1/image/assets/TEMP/713ab25a75c43ca8d950dc89dd5fc37309b8bdd7?width=60";

  const posts = [
    {
      postID: 1,
      author: {
        name: "Andrew Kramer",
        avatar: "https://api.builder.io/api/v1/image/assets/TEMP/06ab1404c33b886a63089b4a767a89bd50c53af5?width=112"
      },
      date: "Jun 18",
      category: "General Discussion",
      title: "Welcome to the group",
      content: "Welcome to the BNB BOSS Academy community group! If you just joined please introduce yourself by telling us: 1.Your name 2.Where you're from 3.What interests you the most about Airbnb 4.What you're",
      likes: 364,
      comments: 120,
      isPinned: true
    },
    {
      postID: 2,
      author: {
        name: "Leadsflow Crm",
        avatar: "https://api.builder.io/api/v1/image/assets/TEMP/a381249158510414e9884a75b3767f9bb1a0f2c8?width=112"
      },
      date: "Sep '24",
      category: "General Discussion",
      title: "Introduction",
      content: "Hello, I'm new here and happy to connect woth likeminded fellow",
      likes: 364,
      comments: 120,
      isPinned: false
    }
  ];

  const handlePostCreate = (postText: any) => {
    console.log('Creating post:', postText);
    // Handle post creation logic here
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-10 p-4 sm:p-6 lg:p-8 max-w-[1573px] mx-auto">
      {/* Community Hero Section */}
      <CommunityHero community={community} />

      {/* Discussion Section */}
      <DiscussionSection
        posts={posts}
        userAvatar={userAvatar}
        onPostCreate={handlePostCreate}
      />
    </div>
  );
};

export default CommunityPage;
