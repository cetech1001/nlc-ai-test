import React from "react";

export const Leaderboard = () => {
  return (
    <div className="glass-card rounded-4xl flex-1 w-1/2 overflow-hidden">
      {/* Background glow */}
      <div className="absolute -left-11 bottom-5 w-56 h-56 bg-streak-gradient opacity-50 blur-[112.55px] rounded-full" />
      <div className="z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-foreground">Leaderboard</h3>
          <div className="flex items-center gap-5 text-sm">
            <span className="text-purple-primary font-bold">7-days</span>
            <div className="w-px h-4 bg-white" />
            <span className="text-muted-foreground">30-days</span>
            <div className="w-px h-4 bg-white" />
            <span className="text-muted-foreground">All time</span>
          </div>
        </div>
        {/* Leaderboard List */}
        <div className="space-y-0">
          {/* User 1 */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-primary flex items-center justify-center">
                <span className="text-xs font-bold text-black">1</span>
              </div>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/7b7ce78b469c6163f6e7431a602a7794238123c6?width=80"
                alt="Andrew Kramer"
                className="w-10 h-10 rounded-lg"
              />
              <span className="font-medium text-foreground">Andrew Kramer</span>
            </div>
            <div className="flex items-center gap-14">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1.5 w-[121px]">
                  <span className="text-sm text-muted-foreground">Milestones:</span>
                  <span className="text-sm font-semibold text-foreground">17/24</span>
                </div>
                <div className="flex items-center gap-1.5 w-20">
                  <span className="text-sm text-muted-foreground">Streak:</span>
                  <span className="text-sm font-semibold text-foreground">17</span>
                </div>
              </div>
              <span className="text-lg font-medium text-purple-primary">+24pt</span>
            </div>
          </div>

          {/* User 2 */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-primary flex items-center justify-center">
                <span className="text-xs font-bold text-black">2</span>
              </div>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/7b7ce78b469c6163f6e7431a602a7794238123c6?width=80"
                alt="Andrew Kramer"
                className="w-10 h-10 rounded-lg"
              />
              <span className="font-medium text-foreground">Andrew Kramer</span>
            </div>
            <div className="flex items-center gap-14">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1.5 w-[121px]">
                  <span className="text-sm text-muted-foreground">Milestones:</span>
                  <span className="text-sm font-semibold text-foreground">16/24</span>
                </div>
                <div className="flex items-center gap-1.5 w-20">
                  <span className="text-sm text-muted-foreground">Streak:</span>
                  <span className="text-sm font-semibold text-foreground">5</span>
                </div>
              </div>
              <span className="text-lg font-medium text-purple-primary">+19pt</span>
            </div>
          </div>

          {/* User 3 */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-primary flex items-center justify-center">
                <span className="text-xs font-bold text-black">3</span>
              </div>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/7b7ce78b469c6163f6e7431a602a7794238123c6?width=80"
                alt="Andrew Kramer"
                className="w-10 h-10 rounded-lg"
              />
              <span className="font-medium text-foreground">Andrew Kramer</span>
            </div>
            <div className="flex items-center gap-14">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1.5 w-[121px]">
                  <span className="text-sm text-muted-foreground">Milestones:</span>
                  <span className="text-sm font-semibold text-foreground">12/24</span>
                </div>
                <div className="flex items-center gap-1.5 w-20">
                  <span className="text-sm text-muted-foreground">Streak:</span>
                  <span className="text-sm font-semibold text-foreground">15</span>
                </div>
              </div>
              <span className="text-lg font-medium text-purple-primary">+11pt</span>
            </div>
          </div>

          {/* User 4 */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div className="flex items-center gap-4">
              <span className="w-6 text-center text-lg font-medium text-foreground">4</span>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/7b7ce78b469c6163f6e7431a602a7794238123c6?width=80"
                alt="Andrew Kramer"
                className="w-10 h-10 rounded-lg"
              />
              <span className="font-medium text-foreground">Andrew Kramer</span>
            </div>
            <div className="flex items-center gap-14">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1.5 w-[121px]">
                  <span className="text-sm text-muted-foreground">Milestones:</span>
                  <span className="text-sm font-semibold text-foreground">14/24</span>
                </div>
                <div className="flex items-center gap-1.5 w-20">
                  <span className="text-sm text-muted-foreground">Streak:</span>
                  <span className="text-sm font-semibold text-foreground">15</span>
                </div>
              </div>
              <span className="text-lg font-medium text-purple-primary">+8pt</span>
            </div>
          </div>

          {/* User 5 */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div className="flex items-center gap-4">
              <span className="w-6 text-center text-lg font-medium text-foreground">5</span>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/7b7ce78b469c6163f6e7431a602a7794238123c6?width=80"
                alt="Andrew Kramer"
                className="w-10 h-10 rounded-lg"
              />
              <span className="font-medium text-foreground">Andrew Kramer</span>
            </div>
            <div className="flex items-center gap-14">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1.5 w-[121px]">
                  <span className="text-sm text-muted-foreground">Milestones:</span>
                  <span className="text-sm font-semibold text-foreground">13/24</span>
                </div>
                <div className="flex items-center gap-1.5 w-20">
                  <span className="text-sm text-muted-foreground">Streak:</span>
                  <span className="text-sm font-semibold text-foreground">3</span>
                </div>
              </div>
              <span className="text-lg font-medium text-purple-primary">+7pt</span>
            </div>
          </div>

          {/* User 6 */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div className="flex items-center gap-4">
              <span className="w-6 text-center text-lg font-medium text-foreground">6</span>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/7b7ce78b469c6163f6e7431a602a7794238123c6?width=80"
                alt="Andrew Kramer"
                className="w-10 h-10 rounded-lg"
              />
              <span className="font-medium text-foreground">Andrew Kramer</span>
            </div>
            <div className="flex items-center gap-14">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1.5 w-[121px]">
                  <span className="text-sm text-muted-foreground">Milestones:</span>
                  <span className="text-sm font-semibold text-foreground">4/24</span>
                </div>
                <div className="flex items-center gap-1.5 w-20">
                  <span className="text-sm text-muted-foreground">Streak:</span>
                  <span className="text-sm font-semibold text-foreground">12</span>
                </div>
              </div>
              <span className="text-lg font-medium text-purple-primary">+4pt</span>
            </div>
          </div>

          {/* User 7 */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <span className="w-6 text-center text-lg font-medium text-foreground">7</span>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/7b7ce78b469c6163f6e7431a602a7794238123c6?width=80"
                alt="Andrew Kramer"
                className="w-10 h-10 rounded-lg"
              />
              <span className="font-medium text-foreground">Andrew Kramer</span>
            </div>
            <div className="flex items-center gap-14">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1.5 w-[121px]">
                  <span className="text-sm text-muted-foreground">Milestones:</span>
                  <span className="text-sm font-semibold text-foreground">3/24</span>
                </div>
                <div className="flex items-center gap-1.5 w-20">
                  <span className="text-sm text-muted-foreground">Streak:</span>
                  <span className="text-sm font-semibold text-foreground">1</span>
                </div>
              </div>
              <span className="text-lg font-medium text-purple-primary">+2pt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
