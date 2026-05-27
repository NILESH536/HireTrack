import React, { useEffect, useRef } from 'react';

const AuroraBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.003;

      for (let c = 0; c < 4; c++) {
        const baseY = canvas.height * (0.15 + c * 0.08);
        const pts = [];
        for (let i = 0; i <= 80; i++) {
          const x = (i / 80) * canvas.width;
          const y = baseY
            + Math.sin(x * 0.003 + time * (1 + c * 0.3) + c * 1.5) * (60 + c * 20)
            + Math.sin(x * 0.007 + time * 0.8 + c * 0.7) * (25 + c * 10);
          pts.push({ x, y });
        }

        const hues = [220, 270, 190, 250];
        const hue = hues[c];
        const curtainH = 120 + c * 30;

        for (let i = 0; i < pts.length - 1; i++) {
          const p1 = pts[i], p2 = pts[i + 1];
          const grad = ctx.createLinearGradient(p1.x, p1.y, p1.x, p1.y + curtainH);
          const intensity = 0.02 + Math.sin(time + i * 0.05 + c) * 0.015;
          grad.addColorStop(0, `hsla(${hue},70%,60%,0)`);
          grad.addColorStop(0.3, `hsla(${hue},75%,55%,${intensity * 1.5})`);
          grad.addColorStop(0.7, `hsla(${hue + 20},65%,50%,${intensity * 0.5})`);
          grad.addColorStop(1, `hsla(${hue},60%,40%,0)`);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p2.x, p2.y + curtainH); ctx.lineTo(p1.x, p1.y + curtainH);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      // Stars
      for (let i = 0; i < 50; i++) {
        const sx = (i * 137.508) % canvas.width;
        const sy = (i * 91.7) % canvas.height;
        const tw = 0.1 + Math.sin(time * 2 + i * 3.14) * 0.08;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.5 + (i % 3) * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${tw})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 60%, #0e1525 0%, #060a14 80%)' }} />;
};

export default AuroraBackground;
