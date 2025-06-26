'use client'

interface IProps {
  height?: number;
  width?: number;
  className?: string;
}

export const Logo = ({ width = 94, height = 80, className = ""}: IProps) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: `${width}px`, height: `${height}px` }}>
      {/*<svg
        width="100%"
        height="100%"
        viewBox="0 0 91 75"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M21.9795 37.2997C21.9795 37.2997 33.4398 27.1444 42.4689 51.5079C51.498 75.8714 71.3759 31.1707 71.3759 31.1707C71.3759 31.1707 60.4303 53.202 46.43 21.6003C32.4296 -10.0014 21.9795 37.2972 21.9795 37.2972V37.2997Z"
          fill="url(#paint0_linear_logo)"
        />
        <path
          d="M0.162109 74.1383C0.162109 74.1383 32.8296 8.00094 46.4312 21.6025C46.4312 21.6025 34.5649 -10.265 18.6963 28.5363C2.82781 67.3375 0.162109 74.1383 0.162109 74.1383Z"
          fill="url(#paint1_linear_logo)"
        />
        <path
          d="M90.3349 0.421875C90.3349 0.421875 55.647 65.5201 42.4707 51.5076C42.4707 51.5076 53.351 83.7256 70.4062 45.4319C87.4589 7.13567 90.3349 0.421875 90.3349 0.421875Z"
          fill="url(#paint2_linear_logo)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_logo"
            x1="26.9351"
            y1="24.2032"
            x2="38.548"
            y2="53.9774"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4C008F" />
            <stop offset="1" stopColor="#ECA1FA" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_logo"
            x1="3.87193"
            y1="71.0393"
            x2="64.3688"
            y2="28.2841"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.0192308" stopColor="#FEBEFA" />
            <stop offset="0.346154" stopColor="#B339D4" />
            <stop offset="0.653846" stopColor="#7B21BA" />
            <stop offset="1" stopColor="#7B26F0" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_logo"
            x1="40.3238"
            y1="70.4935"
            x2="107.954"
            y2="31.9574"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.0192308" stopColor="#FEBEFA" />
            <stop offset="0.346154" stopColor="#B339D4" />
            <stop offset="0.653846" stopColor="#7B21BA" />
            <stop offset="0.855769" stopColor="#7B26F0" />
            <stop offset="1" stopColor="#FEBEFA" />
          </linearGradient>
        </defs>
      </svg>

       Star accent SVG
      <svg
        width="8"
        height="9"
        viewBox="0 0 8 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 right-0"
        style={{
          transform: `scale(${Math.min(width / 94, height / 80)})`,
          transformOrigin: 'top right'
        }}
      >
        <g clipPath="url(#clip0_star)">
          <path
            d="M0.683594 5.21389L7.69949 0.138672L7.71157 8.21794L5.52681 4.71121L0.683594 5.21389Z"
            fill="url(#paint0_linear_star)"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_star"
            x1="4.96427"
            y1="8.21794"
            x2="7.88681"
            y2="1.25866"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.0192308" stopColor="#FEBEFA" />
            <stop offset="0.346154" stopColor="#B339D4" />
            <stop offset="0.653846" stopColor="#7B21BA" />
            <stop offset="1" stopColor="#7B26F0" />
          </linearGradient>
          <clipPath id="clip0_star">
            <rect
              width="7.02798"
              height="8.07927"
              fill="white"
              transform="translate(0.683594 0.138672)"
            />
          </clipPath>
        </defs>
      </svg>*/}
      <img src={"/logo.png"} alt={"Logo"}/>
    </div>
  );
}
