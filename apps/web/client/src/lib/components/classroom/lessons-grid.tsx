import React from 'react';
import { LessonCard } from '@/lib';

interface Lesson {
  image: string;
  title: string;
  description: string;
  locked?: boolean;
}

const lessonsData: Lesson[] = [
  {
    image: "https://api.builder.io/api/v1/image/assets/TEMP/ea1242f159b13c64ef772881089c587ebdfbd5fd?width=1016",
    title: "Email notifications",
    description: "If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online.",
    locked: false
  },
  {
    image: "https://api.builder.io/api/v1/image/assets/TEMP/67d7ac3fa1ad750fdac7006414f332a680bcf9c6?width=1016",
    title: "Email notifications",
    description: "If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online.",
    locked: true
  },
  {
    image: "https://api.builder.io/api/v1/image/assets/TEMP/b0f5f52f71547a27270cba30b3a1644a4ab8fc80?width=1016",
    title: "Email notifications",
    description: "If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online.",
    locked: true
  },
  {
    image: "https://api.builder.io/api/v1/image/assets/TEMP/ea1242f159b13c64ef772881089c587ebdfbd5fd?width=1016",
    title: "Email notifications",
    description: "If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online.",
    locked: true
  },
  {
    image: "https://api.builder.io/api/v1/image/assets/TEMP/67d7ac3fa1ad750fdac7006414f332a680bcf9c6?width=1016",
    title: "Email notifications",
    description: "If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online.",
    locked: true
  },
  {
    image: "https://api.builder.io/api/v1/image/assets/TEMP/b0f5f52f71547a27270cba30b3a1644a4ab8fc80?width=1016",
    title: "Email notifications",
    description: "If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online.",
    locked: true
  }
];

export const LessonsGrid = () => {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Mobile: Single column */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {lessonsData.map((lesson, index) => (
          <LessonCard
            key={index}
            image={lesson.image}
            title={lesson.title}
            description={lesson.description}
            locked={lesson.locked}
          />
        ))}
      </div>

      {/* Tablet: Two columns */}
      <div className="hidden sm:grid md:hidden grid-cols-2 gap-4 sm:gap-5">
        {lessonsData.map((lesson, index) => (
          <LessonCard
            key={index}
            image={lesson.image}
            title={lesson.title}
            description={lesson.description}
            locked={lesson.locked}
          />
        ))}
      </div>

      {/* Desktop: Three columns in rows */}
      <div className="hidden md:block space-y-4 lg:space-y-6">
        {/* First row */}
        <div className="grid grid-cols-3 gap-4 lg:gap-6">
          {lessonsData.slice(0, 3).map((lesson, index) => (
            <LessonCard
              key={index}
              image={lesson.image}
              title={lesson.title}
              description={lesson.description}
              locked={lesson.locked}
            />
          ))}
        </div>

        {/* Second row */}
        <div className="grid grid-cols-3 gap-4 lg:gap-6">
          {lessonsData.slice(3, 6).map((lesson, index) => (
            <LessonCard
              key={index + 3}
              image={lesson.image}
              title={lesson.title}
              description={lesson.description}
              locked={lesson.locked}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
