import React, { useEffect, useRef, useState } from 'react';

interface MotionTriggerProps {
  onPull: () => void;
  onPullProgress: (progress: number) => void; // 0 to 1
  isActive: boolean;
}

const MotionTrigger: React.FC<MotionTriggerProps> = ({ onPull, onPullProgress, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pullState = useRef({
    isDragging: false,
    startY: 0,
    currentProgress: 0,
    maxPullDistance: 200,
  });

  const mousePos = useRef({ x: 0, y: 0 });
  const particles = useRef<{ x: number, y: number, vx: number, vy: number, alpha: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        alpha: Math.random()
      });
    }

    let animationFrame: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Target for particles: Mouse position
      const targetX = mousePos.current.x;
      const targetY = mousePos.current.y;

      particles.current.forEach(p => {
        // Attraction to hand
        const dx = targetX - p.x;
        const dy = targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 300) {
          const force = (300 - dist) / 3000;
          p.vx += dx * force;
          p.vy += dy * force;
        }

        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;

        // Visuals
        ctx.fillStyle = `rgba(255, 215, 0, ${p.alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Wrap around screen
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isActive) return;
    // We start dragging regardless of position for better accessibility, 
    // but visually it feels like grabbing the rope.
    pullState.current.isDragging = true;
    pullState.current.startY = e.clientY;
    document.body.classList.remove('custom-hand-cursor');
    document.body.classList.add('custom-hand-cursor-grabbing');
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };

    if (pullState.current.isDragging && isActive) {
      const delta = Math.max(0, e.clientY - pullState.current.startY);
      const progress = Math.min(delta / pullState.current.maxPullDistance, 1);
      pullState.current.currentProgress = progress;
      onPullProgress(progress);

      if (progress >= 1) {
        onPull();
        pullState.current.isDragging = false;
        onPullProgress(0);
        document.body.classList.remove('custom-hand-cursor-grabbing');
        document.body.classList.add('custom-hand-cursor');
      }
    }
  };

  const handlePointerUp = () => {
    if (pullState.current.isDragging) {
      pullState.current.isDragging = false;
      onPullProgress(0);
      document.body.classList.remove('custom-hand-cursor-grabbing');
      document.body.classList.add('custom-hand-cursor');
    }
  };

  return (
    <div 
      className="absolute inset-0 z-30 touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />
      {isActive && (
        <div className="absolute top-[65vh] left-1/2 -translate-x-1/2 text-gray-400 text-sm tracking-widest uppercase pointer-events-none animate-pulse">
          Click and pull down to ring
        </div>
      )}
    </div>
  );
};

export default MotionTrigger;