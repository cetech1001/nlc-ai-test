import {PostCard} from "@/lib";

export const PostsList = ({ posts }: any) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {posts.map((post: any) => (
        <PostCard key={post.postID} post={post} />
      ))}
    </div>
  );
};
