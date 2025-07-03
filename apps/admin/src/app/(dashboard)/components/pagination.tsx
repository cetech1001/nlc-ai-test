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

  const handlePageClick = (page: number) => {
    if (page === props.currentPage) return;

    props.setCurrentPage(page);

    const scrollToTop = () => {
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo(0, 0);
      }

      setTimeout(() => {
        if (window.pageYOffset > 100) {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 100);

      setTimeout(() => {
        if (window.pageYOffset > 100) {
          window.scroll(0, 0);
        }
      }, 200);
    };

    requestAnimationFrame(() => {
      scrollToTop();
    });

    setTimeout(() => {
      if (window.pageYOffset > 100) {
        window.scrollTo(0, 0);
      }
    }, 300);
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="flex items-center justify-end gap-5">
        {getPaginationPages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && handlePageClick(page)}
            disabled={page === "..." || page === props.currentPage}
            className={`w-10 min-w-10 min-h-10 h-10 p-2.5 rounded-[10px] flex items-center justify-center text-xl font-semibold leading-relaxed transition-colors ${
              page === props.currentPage
                ? "bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-stone-50 cursor-default"
                : page === "..."
                  ? "bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 border border-neutral-700 text-stone-50 cursor-default"
                  : "bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 border border-neutral-700 text-stone-50 hover:bg-gradient-to-r hover:from-fuchsia-600/20 hover:via-purple-700/20 hover:to-violet-600/20 cursor-pointer"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
