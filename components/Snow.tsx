import React, { useEffect, useRef } from 'react';

const Snow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: { x: number; y: number; radius: number; speed: number; wind: number }[] = [];
    const particleCount = 150;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 3 + 1,
        wind: Math.random() * 2 - 1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'white';
      ctx.beginPath();
      
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, true);
        
        p.y += p.speed;
        p.x += p.wind;

        if (p.y > height) {
          p.y = -5;
          p.x = Math.random() * width;
        }
      }
      ctx.fill();
      requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
        if(canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            width = window.innerWidth;
            height = window.innerHeight;
        }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />;
};

export default Snow;