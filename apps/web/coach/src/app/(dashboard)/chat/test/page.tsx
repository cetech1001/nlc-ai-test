import { Send, Paperclip } from "lucide-react";

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isBot: boolean;
}

const Chatbot = () => {
  const messages: Message[] = [
    {
      id: 1,
      sender: "Brooklyn Simmons",
      text: "Hey welcome back! How's everything going with your program?\nLet me know if you need any help today!",
      time: "12:10 PM",
      isBot: true,
    },
    {
      id: 2,
      sender: "Eleanor Pena",
      text: "Hey! I'm doing okay, but I feel like I'm struggling with my workouts this week.\nNot sure if I'm doing the exercises right.",
      time: "12:12 PM",
      isBot: false,
    },
    {
      id: 3,
      sender: "Eleanor Pena",
      text: "I totally get it, It's normal to hit some bumps along the way. Let's do a quick check-in.\nAre you following the correct form for your exercises?\nSometimes the smallest adjustments can make a big difference!",
      time: "12:15 PM",
      isBot: true,
    },
    {
      id: 4,
      sender: "Eleanor Pena",
      text: "I think I'm following the moves, but I'm unsure about my form in squats and deadlifts.",
      time: "12:12 PM",
      isBot: false,
    },
    {
      id: 5,
      sender: "Eleanor Pena",
      text: "No worries, I've got you covered! Here's a quick form tip for squats:",
      time: "12:15 PM",
      isBot: true,
    },
    {
      id: 6,
      sender: "Eleanor Pena",
      text: "Keep your feet shoulder-width apart.\nPush your hips back as if you're sitting in a chair.\nKeep your chest up and back straight—don't let your knees go past your toes.",
      time: "12:15 PM",
      isBot: true,
    },
    {
      id: 7,
      sender: "Eleanor Pena",
      text: "For deadlifts, make sure your back stays flat, and your hips move back as you bend forward.\nIf you're feeling unsure, I can recommend a form video to watch. Would you like that?",
      time: "12:15 PM",
      isBot: true,
    },
  ];

  return (
    <div className="relative flex flex-col w-full h-[97vh] bg-dark px-4 overflow-hidden">
      {/* Glow Circles */}
      <div className="absolute -left-[273px] -top-[209px] w-[547px] h-[547px] rounded-full opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 blur-[112.55px] pointer-events-none" />
      <div className="absolute right-[168px] bottom-[-209px] w-[547px] h-[547px] rounded-full opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 blur-[112.55px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 lg:px-8 py-10 h-[140px] z-10">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex-shrink-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
              alt="Brooklyn Simmons"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name and Title */}
          <div className="flex flex-col gap-2.5">
            <h1 className="text-[#F9F9F9] text-2xl lg:text-4xl font-semibold tracking-tight">
              Brooklyn Simmons
            </h1>
            <p className="text-[#C5C5C5] text-base lg:text-xl tracking-tight">
              Chat Assistant
            </p>
          </div>
        </div>

        {/* Logo */}
        <div className="relative w-[94px] h-20 hidden lg:block">
          <svg
            className="absolute left-0 top-1.5 w-[90px] h-[74px]"
            viewBox="0 0 91 74"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0)">
              <path
                d="M21.8203 37.161C21.8203 37.161 33.2806 27.0057 42.3097 51.3692C51.3388 75.7327 71.2167 31.0321 71.2167 31.0321C71.2167 31.0321 60.2712 53.0633 46.2708 21.4616C32.2704 -10.1401 21.8203 37.1586 21.8203 37.1586V37.161Z"
                fill="url(#paint0_linear)"
              />
              <path
                d="M0 73.9998C0 73.9998 32.6675 7.86239 46.2691 21.464C46.2691 21.464 34.4028 -10.4036 18.5342 28.3977C2.6657 67.199 0 73.9998 0 73.9998Z"
                fill="url(#paint1_linear)"
              />
              <path
                d="M90.1767 0.283203C90.1767 0.283203 55.4887 65.3814 42.3125 51.3689C42.3125 51.3689 53.1928 83.5869 70.248 45.2932C87.3007 6.997 90.1767 0.283203 90.1767 0.283203Z"
                fill="url(#paint2_linear)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear"
                x1="31.3957"
                y1="22.7096"
                x2="52.9279"
                y2="51.4192"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#521A79" />
                <stop offset="0.490385" stopColor="#E587FF" />
                <stop offset="1" stopColor="#6839A8" />
              </linearGradient>
              <linearGradient
                id="paint1_linear"
                x1="3.70982"
                y1="70.9008"
                x2="64.2067"
                y2="28.1455"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.0192308" stopColor="#FEBEFA" />
                <stop offset="0.346154" stopColor="#B339D4" />
                <stop offset="0.653846" stopColor="#7B21BA" />
                <stop offset="1" stopColor="#7B26F0" />
              </linearGradient>
              <linearGradient
                id="paint2_linear"
                x1="39.601"
                y1="79.1033"
                x2="106.647"
                y2="39.7725"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.0192308" stopColor="#FEBEFA" />
                <stop offset="0.346154" stopColor="#B339D4" />
                <stop offset="0.653846" stopColor="#7B21BA" />
                <stop offset="1" stopColor="#7B26F0" />
              </linearGradient>
              <clipPath id="clip0">
                <rect width="90.1722" height="73.7164" fill="white" transform="translate(0 0.283203)" />
              </clipPath>
            </defs>
          </svg>
          <svg
            className="absolute right-0 top-0 w-[7px] h-[8px]"
            viewBox="0 0 8 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip1)">
              <path
                d="M0.515625 5.07522L7.53152 0L7.5436 8.07927L5.35884 4.57253L0.515625 5.07522Z"
                fill="url(#paint3_linear)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint3_linear"
                x1="4.7963"
                y1="8.07927"
                x2="7.71884"
                y2="1.11999"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.0192308" stopColor="#FEBEFA" />
                <stop offset="0.346154" stopColor="#B339D4" />
                <stop offset="0.653846" stopColor="#7B21BA" />
                <stop offset="1" stopColor="#7B26F0" />
              </linearGradient>
              <clipPath id="clip1">
                <rect width="7.02798" height="8.07927" fill="white" transform="translate(0.515625)" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-6 z-10 custom-scrollbar">
        <div className="flex flex-col gap-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-2.5 max-w-full ${
                message.isBot ? "items-start" : "items-end ml-auto"
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-2">
                <span className="text-[#C5C5C5] text-xs">
                  {message.sender}
                </span>
                {message.isBot && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-[#D9D9D9]" />
                    <span className="text-[#C5C5C5] text-xs">
                      {message.time}
                    </span>
                  </>
                )}
                {!message.isBot && (
                  <span className="text-[#C5C5C5] text-xs">
                    {message.time}
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex px-5 py-2.5 justify-center items-center rounded-[10px] ${
                  message.isBot
                    ? "bg-[#1A1A1A]"
                    : "bg-[rgba(223,105,255,0.08)]"
                }`}
              >
                <p className="text-[#C5C5C5] text-base lg:text-lg whitespace-pre-line">
                  {message.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex items-center justify-center px-6 lg:px-8 pb-12 z-10">
        <div className="flex w-full min-h-[50px] max-h-16 px-5 py-2.5 justify-between items-center rounded-[10px] border border-[rgba(255,255,255,0.3)] bg-dark">
          {/* Input and Attachment */}
          <div className="flex items-center gap-2.5 flex-1">
            <button className="flex p-2.5 items-center justify-center rounded-full bg-[#1B1511]">
              <Paperclip className="w-3.5 h-3.5 text-white/50" />
            </button>
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-white text-base leading-5 placeholder:text-white/50 outline-none"
            />
          </div>

          {/* Send Button */}
          <button className="flex p-2.5 items-center justify-center rounded-full bg-gradient-to-r from-[#B339D4] via-[#7B21BA] to-[#7B26F0]">
            <Send className="w-6 h-6 text-[#F9F9F9] fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
