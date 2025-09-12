import React from 'react';

export const LessonVideoPlayer = () => {
  return (
    <div className="glass-card rounded-4xl p-6 sm:p-10 lg:p-16 space-y-4 sm:space-y-6">
      {/* Video Player */}
      <div className="flex justify-center">
        <div className="w-full max-w-[645px] aspect-video">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/36e075dd792b9374e13d1bc0c9ce41cea0603ea1?width=1290"
            alt="Video content"
            className="w-full h-full rounded-2xl sm:rounded-3xl object-cover"
          />
        </div>
      </div>

      {/* Content Description */}
      <div className="space-y-4 sm:space-y-6">
        <p className="text-sm sm:text-base leading-relaxed sm:leading-6 max-w-[645px] mx-auto text-center">
          <span className="text-foreground">Content that answers your target audience' questions! Get more tips on how to create speaking videos in the </span>
          <span className="text-purple-primary">VALUE VIDEOS</span>
          <span className="text-foreground"> module.</span>
        </p>

        {/* Examples Section */}
        <div className="space-y-4 sm:space-y-6 max-w-[645px] mx-auto">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">Examples:</h3>

          <div className="space-y-4 sm:space-y-6">
            {/* Q&A Items */}
            {[
              {
                question: "What is MRR?",
                link: "https://www.instagram.com/reel/CxbOqEGppSI/"
              },
              {
                question: "What is the difference between Affiliate & Digital Marketing?",
                link: "https://www.instagram.com/reel/CxbOqEGppSI/"
              },
              {
                question: "How do you get paid?",
                link: "https://www.instagram.com/reel/CxbOqEGppSI/"
              }
            ].map((item, index) => (
              <div key={index} className="space-y-1">
                <p className="text-sm sm:text-base text-foreground leading-relaxed sm:leading-[22px]">
                  {item.question}
                </p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base text-purple-primary leading-relaxed sm:leading-[22px] hover:underline break-all"
                >
                  {item.link}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
