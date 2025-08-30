import React, { useState, useEffect, useRef } from 'react';

interface Dot {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    speedX: number;
    speedY: number;
}

const DOT_COUNT = 60
const SPEED_RANGE = 8

export const AnimatedDots: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const rafId = useRef<number | null>(null);
    const lastTs = useRef<number | null>(null);

    // Many dots; adjust density as needed
    const DOT_COUNT = 320;
    const SPEED_RANGE = 14; // px per second in percentage units (~faster)

    type LiveDot = Dot & { node: HTMLDivElement };
    const liveDots = useRef<LiveDot[]>([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Create dots imperatively for perf (avoid React re-render every frame)
        const created: LiveDot[] = [];
        for (let i = 0; i < DOT_COUNT; i++) {
            const size = Math.random() * 1 + 0.5; // 0.5px – 1.5px
            const dot: LiveDot = {
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size,
                opacity: Math.random() * 0.5 + 0.3, // 0.3 – 0.8
                // subtle horizontal drift
                speedX: (Math.random() - 0.5) * (SPEED_RANGE * 0.3),
                // always move upwards (negative Y). ensure a non-trivial speed
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
            node.style.background = '#ffffff'; // white dots
            node.style.filter = 'blur(0.5px)';
            node.style.willChange = 'left, top, transform';
            node.style.transform = 'translateZ(0)';

            container.appendChild(node);
            created.push(dot);
        }
        liveDots.current = created;

        const tick = (ts: number) => {
            if (lastTs.current == null) lastTs.current = ts;
            const dt = (ts - lastTs.current) / 1000; // seconds
            lastTs.current = ts;

            // update positions and apply styles directly
            for (const d of liveDots.current) {
                d.x = (d.x + d.speedX * dt + 100) % 100;
                d.y = (d.y + d.speedY * dt + 100) % 100;
                d.node.style.left = `${d.x}%`;
                d.node.style.top = `${d.y}%`;
            }

            rafId.current = requestAnimationFrame(tick);
        };

        rafId.current = requestAnimationFrame(tick);

        return () => {
            if (rafId.current != null) cancelAnimationFrame(rafId.current);
            // Clean up DOM nodes
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

export const PageBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden" style={{ background: '#070300' }}>
            <AnimatedDots />

            <GlowOrbs />

            <div className="z-10">
                {children}
            </div>
        </div>
    );
};
