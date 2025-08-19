import React, {FC} from "react";

interface IProps {
  loadMorePosts: () => void;
  isLoading: boolean;
}

export const LoadMorePosts: FC<IProps> = (props) => {
  return (
    <div className="flex justify-center py-6">
      <button
        onClick={props.loadMorePosts}
        disabled={props.isLoading}
        className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {props.isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <>Load More Posts</>
        )}
      </button>
    </div>
  );
}
