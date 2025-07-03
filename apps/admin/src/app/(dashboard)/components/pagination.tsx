import {Dispatch, SetStateAction} from "react";

interface IProps {
  totalPages: number;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
}

export const Pagination = (props: IProps) => {
  const getPaginationPages = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (props.totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= props.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (props.currentPage > 3) {
        pages.push("...");
      }
      const start = Math.max(2, props.currentPage - 1);
      const end = Math.min(props.totalPages - 1, props.currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== props.totalPages) {
          pages.push(i);
        }
      }
      if (props.currentPage < props.totalPages - 2) {
        pages.push("...");
      }
      if (props.totalPages > 1) {
        pages.push(props.totalPages);
      }
    }
    return pages;
  };

  const smoothScrollToTop = () => {
    const startPosition = window.pageYOffset;
    const duration = 500;
    const startTime = performance.now();

    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentPosition = startPosition * (1 - easedProgress);
      window.scrollTo(0, currentPosition);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        window.scrollTo(0, 0);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const handlePageClick = (page: number) => {
    if (page === props.currentPage) return;

    // Update page state immediately
    props.setCurrentPage(page);

    // Start smooth scroll animation
    smoothScrollToTop();
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="flex items-center justify-end gap-5">
        {getPaginationPages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && handlePageClick(page)}
            disabled={page === "..." || page === props.currentPage}
            className={`w-10 min-w-10 min-h-10 h-10 p-2.5 rounded-[10px] flex items-center justify-center text-xl font-semibold leading-relaxed transition-all duration-200 ${
              page === props.currentPage
                ? "bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-stone-50 cursor-default"
                : page === "..."
                  ? "bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 border border-neutral-700 text-stone-50 cursor-default"
                  : "bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 border border-neutral-700 text-stone-50 hover:bg-gradient-to-r hover:from-fuchsia-600/20 hover:via-purple-700/20 hover:to-violet-600/20 cursor-pointer active:scale-95"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
