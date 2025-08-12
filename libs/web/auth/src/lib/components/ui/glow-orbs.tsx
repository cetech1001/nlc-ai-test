'use client'

export const GlowOrbs = () => (
  <>
    <div
      className="absolute opacity-20 blur-[112px] pointer-events-none rounded-full"
      style={{
        width: "547px",
        height: "547px",
        background:
          "radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)",
        left: "-273px",
        top: "-209px",
      }}
    />

    <div
      className="absolute opacity-20 blur-[112px] pointer-events-none rounded-full"
      style={{
        width: "547px",
        height: "547px",
        background:
          "radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)",
        right: "-273px",
        bottom: "-209px",
      }}
    />
  </>
);
