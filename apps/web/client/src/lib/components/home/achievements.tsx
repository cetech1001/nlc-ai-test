import React, {FC} from "react";

const images = {
  completed: 'https://api.builder.io/api/v1/image/assets/TEMP/1c052f895e7ece754417acf3b56de509e77ef65e?width=160',
  incomplete: 'https://api.builder.io/api/v1/image/assets/TEMP/593e1f95f60738a927b56eac012618781590736e?width=162',
}

interface AchievementProps {
  title: string;
  completed: boolean;
}

const AchievementCard: FC<AchievementProps> = ({ title, completed }) => {
  return (
    <div className="glass-card rounded-4xl p-8 flex-1 flex flex-col items-center gap-2.5 relative">
      <img
        src={completed ? images.completed : images.incomplete}
        alt="Achievement badge"
        className="w-20 h-[91px] mix-blend-screen"
      />
      <p className="text-sm font-semibold text-center text-white leading-[19.6px]">{title}</p>
      {completed && (
        <svg className="absolute top-[25px] right-5 w-6 h-6" viewBox="0 0 25 24" fill="none">
          <path d="M9.33594 12.75L11.5859 15L15.3359 9.75M21.3359 12C21.3359 13.1819 21.1031 14.3522 20.6509 15.4442C20.1986 16.5361 19.5356 17.5282 18.6999 18.364C17.8642 19.1997 16.872 19.8626 15.7801 20.3149C14.6882 20.7672 13.5178 21 12.3359 21C11.154 21 9.98372 20.7672 8.89179 20.3149C7.79986 19.8626 6.8077 19.1997 5.97198 18.364C5.13625 17.5282 4.47331 16.5361 4.02102 15.4442C3.56873 14.3522 3.33594 13.1819 3.33594 12C3.33594 9.61305 4.28415 7.32387 5.97198 5.63604C7.6598 3.94821 9.94899 3 12.3359 3C14.7229 3 17.0121 3.94821 18.6999 5.63604C20.3877 7.32387 21.3359 9.61305 21.3359 12Z" stroke="#09B90F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

export const Achievements = () => {
  return (
    <div className="glass-card rounded-4xl w-3/5 overflow-hidden">
      <div className="absolute -left-11 bottom-5 w-56 h-56 bg-streak-gradient opacity-50 blur-[112.55px] rounded-full" />
      <div className="z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-foreground">Achievements</h3>
          <span className="text-lg font-semibold text-purple-primary">View All Achievements</span>
        </div>
        <div className="space-y-5">
          <div className="flex gap-5">
            <AchievementCard title={'Check out the first module of lessons'} completed={false}/>
            <AchievementCard title={'Check out the first module of lessons'} completed={false}/>
            <AchievementCard title={'Check out the first module of lessons'} completed={true}/>
          </div>

          <div className="flex gap-5">
            <AchievementCard title={'Check out the first module of lessons'} completed={true}/>
            <AchievementCard title={'Check out the first module of lessons'} completed={true}/>
            <AchievementCard title={'Check out the first module of lessons'} completed={true}/>
          </div>
        </div>
      </div>
    </div>
  );
}
