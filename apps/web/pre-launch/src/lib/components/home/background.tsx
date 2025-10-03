import React, { useEffect, useRef } from 'react';

interface Dot {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
}

export const AnimatedDots: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafID = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);

  const DOT_COUNT = 320;
  const SPEED_RANGE = 8;

  type LiveDot = Dot & { node: HTMLDivElement };
  const liveDots = useRef<LiveDot[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent flash by setting initial opacity immediately
    container.style.opacity = '0';

    // Use double RAF to ensure DOM is fully ready and painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const created: LiveDot[] = [];
        for (let i = 0; i < DOT_COUNT; i++) {
          const size = Math.random() + 0.5;
          const dot: LiveDot = {
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size,
            opacity: Math.random() * 0.5 + 0.3,
            speedX: (Math.random() - 0.5) * (SPEED_RANGE * 0.3),
            speedY: - (Math.random() * (SPEED_RANGE * 0.8) + SPEED_RANGE * 0.2),
            node: document.createElement('div'),
          };

          const node = dot.node;
          node.className = 'absolute rounded-full';
          node.style.position = 'absolute';
          node.style.left = `${dot.x}%`;
          node.style.top = `${dot.y}%`;
          node.style.width = `${dot.size}px`;
          node.style.height = `${dot.size}px`;
          node.style.opacity = `${dot.opacity}`;
          node.style.background = '#ffffff';
          node.style.filter = 'blur(0.5px)';
          node.style.willChange = 'left, top, transform';
          node.style.transform = 'translateZ(0)';

          container.appendChild(node);
          created.push(dot);
        }
        liveDots.current = created;

        // Fade in after dots are created and positioned
        container.style.transition = 'opacity 0.5s ease-in';
        container.style.opacity = '1';

        const tick = (ts: number) => {
          if (lastTs.current == null) lastTs.current = ts;
          const dt = (ts - lastTs.current) / 1000;
          lastTs.current = ts;

          for (const d of liveDots.current) {
            d.x = (d.x + d.speedX * dt + 100) % 100;
            d.y = (d.y + d.speedY * dt + 100) % 100;
            d.node.style.left = `${d.x}%`;
            d.node.style.top = `${d.y}%`;
          }

          rafID.current = requestAnimationFrame(tick);
        };

        rafID.current = requestAnimationFrame(tick);
      });
    });

    return () => {
      if (rafID.current != null) cancelAnimationFrame(rafID.current);
      for (const d of liveDots.current) {
        if (d.node && d.node.parentNode === container) {
          container.removeChild(d.node);
        }
      }
      liveDots.current = [];
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  );
};

export const GlowOrbs: React.FC = () => (
  <>
    <div className="hidden sm:block fixed top-0 right-0 w-96 h-96 bg-gradient-to-r from-fuchsia-600/20 via-purple-600/20 to-violet-600/20 rounded-full blur-3xl"></div>
    <div className="hidden sm:block fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 rounded-full blur-3xl"></div>
  </>
);

export const PageBackground: React.FC<{ children: React.ReactNode, displayDots?: boolean; }> = ({ children, displayDots = false }) => {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden" style={{ background: '#070300' }}>
      {displayDots && (
        <AnimatedDots />
      )}

      <GlowOrbs />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
