import { BackTo } from "@nlc-ai/web-shared";

export const LeadFormSkeleton = ({ title, onBack }: { title: string; onBack: () => void }) => {
  return (
    <main className="flex-1 pt-2 sm:pt-8">
      <div className="animate-pulse">
        <BackTo title={title} onClick={onBack} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Form Skeleton */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-2xl blur opacity-30"></div>

              <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-6 space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg"></div>
                    <div className="h-6 bg-neutral-700 rounded w-48"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-700 rounded w-24"></div>
                      <div className="h-10 bg-neutral-700 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-700 rounded w-24"></div>
                      <div className="h-10 bg-neutral-700 rounded"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-700 rounded w-28"></div>
                      <div className="h-10 bg-neutral-700 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-700 rounded w-28"></div>
                      <div className="h-10 bg-neutral-700 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Lead Details Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg"></div>
                    <div className="h-6 bg-neutral-700 rounded w-32"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-700 rounded w-24"></div>
                      <div className="h-10 bg-neutral-700 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-700 rounded w-24"></div>
                      <div className="h-10 bg-neutral-700 rounded"></div>
                    </div>
                  </div>

                  {/* Meeting Fields (conditionally visible) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-700 rounded w-28"></div>
                      <div className="h-10 bg-neutral-700 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-700 rounded w-28"></div>
                      <div className="h-10 bg-neutral-700 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg"></div>
                    <div className="h-6 bg-neutral-700 rounded w-36"></div>
                  </div>
                  <div className="h-20 bg-neutral-700 rounded"></div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                  <div className="h-10 bg-gradient-to-t from-fuchsia-200/20 via-fuchsia-600/20 to-violet-600/20 rounded px-8 flex-1"></div>
                  <div className="h-10 bg-neutral-700 rounded px-8 flex-1"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            {/* Automation Preview Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-emerald-600/20 rounded-2xl blur opacity-30"></div>

              <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-xl"></div>
                  <div>
                    <div className="h-5 bg-neutral-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-neutral-700 rounded w-36"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
                    <div className="h-4 bg-neutral-700 rounded w-40 mb-2"></div>
                    <div className="h-3 bg-neutral-700 rounded w-full mb-4"></div>

                    <div className="space-y-2">
                      <div className="h-3 bg-neutral-700 rounded w-28 mb-2"></div>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-[#0A0A0A] rounded-lg">
                          <div className="w-6 h-6 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-full"></div>
                          <div className="h-3 bg-neutral-700 rounded flex-1"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="h-3 bg-neutral-700 rounded w-28"></div>
                    </div>
                    <div className="h-3 bg-neutral-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Timeline Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur opacity-20"></div>

              <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="h-5 bg-neutral-700 rounded w-24 mb-4"></div>

                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                      <div className="w-4 h-4 bg-green-400/20 rounded-full"></div>
                      <div>
                        <div className="h-3 bg-neutral-700 rounded w-20 mb-1"></div>
                        <div className="h-2 bg-neutral-700 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
