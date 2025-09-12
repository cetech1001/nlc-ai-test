export const PageHeader = () => {
  return (
    <div className="flex items-center justify-between h-full">
      <div className="flex-1 max-w-[640px]">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search for.."
            className="w-full h-[50px] pl-14 pr-5 bg-white/[0.17] border-0 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-white hover:text-primary transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        <button className="text-white hover:text-primary transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M15 17h5l-5 5-5-5h5zm0 0V9a6 6 0 00-12 0v8m0 0h5" />
          </svg>
        </button>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-glass-gradient">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/713ab25a75c43ca8d950dc89dd5fc37309b8bdd7?width=60"
            alt="Andrew Kramer"
            className="w-[30px] h-[30px] rounded-lg"
          />
          <div className="text-left">
            <div className="text-sm font-medium text-foreground">Andrew Kramer</div>
            <div className="text-xs text-muted-foreground">kramer.andrew@email.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
