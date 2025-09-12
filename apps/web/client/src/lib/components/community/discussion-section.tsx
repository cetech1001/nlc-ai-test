'use client'

import {useState} from "react";
import {DiscussionTabNav, PostInput, PostsList} from "@/lib";

export const DiscussionSection = ({ posts, userAvatar, onPostCreate }: any) => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="rounded-[30px] border border-dark-600 p-4 sm:p-6 lg:p-8">
      <div className="space-y-5 sm:space-y-6">
        {/* Post Input */}
        <PostInput
          userAvatar={userAvatar}
          onPostCreate={onPostCreate}
        />

        {/* Tab Navigation */}
        <DiscussionTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Posts List */}
        <PostsList posts={posts} />
      </div>
    </div>
  );
};
