import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  length: number;
  opacity: number;
  factor: number;
  speed: number;
  radius: number;
  twinkleSpeed: number;
}

export const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Star[] = [];
    let animationFrameId: number;

    const initStars = () => {
      const starCount = Math.floor((window.innerWidth * window.innerHeight) / 4000);
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          length: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3,
          factor: Math.random() * 0.5 + 0.5,
          speed: Math.random() * 0.05 + 0.02,
          radius: Math.random() * 1.5,
          twinkleSpeed: Math.random() * 0.002 + 0.0005,
        });
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const time = Date.now();

      stars.forEach((star) => {
        // Calculate smooth twinkling opacity
        const twinkle = Math.sin(time * star.twinkleSpeed);
        const currentOpacity = Math.max(0.1, Math.min(1, star.opacity + twinkle * 0.2));

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.lineWidth = 1.5;
        
        // Update position
        star.x += star.speed;
        star.y += star.speed * 0.5;

        // Wrap around
        if (star.x > canvas.width) star.x = 0;
        if (star.y > canvas.height) star.y = 0;

        // Draw trail
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${currentOpacity * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(star.x, star.y);
        const trailLen = star.length * 50; // Longer trails
        ctx.lineTo(star.x - trailLen * star.speed, star.y - trailLen * star.speed * 0.5);
        ctx.stroke();

        // Draw star head
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};
