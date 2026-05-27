import React, { useEffect, useRef } from 'react';

/**
 * NeuralWaveBackground — For the Login page
 * Flowing sine-wave lines with glowing nodes, reactive to mouse.
 * Color: electric blue + cyan
 */
const NeuralWaveBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let mouseX = -1000, mouseY = -1000;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('mousemove', handleMouse);

    // Wave parameters
    const waveCount = 5;
    const nodeSpacing = 60;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008;

      for (let w = 0; w < waveCount; w++) {
        const baseY = canvas.height * (0.2 + (w * 0.15));
        const amplitude = 40 + w * 12;
        const frequency = 0.008 + w * 0.002;
        const speed = time * (1 + w * 0.3);
        const hue = 200 + w * 15; // blue to cyan
        const alpha = 0.12 + w * 0.03;

        // Draw wave line
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.lineWidth = 1.5;

        const points = [];
        for (let x = -20; x <= canvas.width + 20; x += 3) {
          // Base sine wave
          let y = baseY + Math.sin(x * frequency + speed) * amplitude;
          y += Math.sin(x * frequency * 2.3 + speed * 1.5) * (amplitude * 0.3);

          // Mouse repulsion
          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            y += (dy / (dist || 1)) * force * 50;
          }

          points.push({ x, y });
          if (x === -20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw nodes on wave
        for (let i = 0; i < points.length; i += Math.floor(nodeSpacing / 3)) {
          const p = points[i];
          if (!p) continue;

          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const proximity = dist < 200 ? (200 - dist) / 200 : 0;

          const nodeRadius = 2 + proximity * 3;
          const nodeAlpha = 0.3 + proximity * 0.7;

          // Glow
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, nodeRadius * 4);
          glow.addColorStop(0, `hsla(${hue}, 85%, 65%, ${nodeAlpha * 0.5})`);
          glow.addColorStop(1, `hsla(${hue}, 85%, 65%, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, nodeRadius * 4, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 85%, 70%, ${nodeAlpha})`;
          ctx.fill();

          // Connect nodes across waves
          if (w < waveCount - 1) {
            const nextBaseY = canvas.height * (0.2 + ((w + 1) * 0.15));
            let nextY = nextBaseY + Math.sin(p.x * (0.008 + (w + 1) * 0.002) + time * (1 + (w + 1) * 0.3)) * (40 + (w + 1) * 12);

            const cdx = p.x - mouseX;
            const cdy = nextY - mouseY;
            const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
            if (cdist < 180) {
              const force = (180 - cdist) / 180;
              nextY += (cdy / (cdist || 1)) * force * 50;
            }

            const connAlpha = 0.04 + proximity * 0.08;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${hue + 10}, 70%, 60%, ${connAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, nextY);
            ctx.stroke();
          }
        }
      }

      // Floating ambient particles
      const particleTime = time * 0.5;
      for (let i = 0; i < 30; i++) {
        const px = ((Math.sin(i * 3.7 + particleTime) + 1) / 2) * canvas.width;
        const py = ((Math.cos(i * 2.3 + particleTime * 0.7) + 1) / 2) * canvas.height;
        const size = 1 + Math.sin(i * 1.3 + particleTime) * 0.5;
        const pAlpha = 0.15 + Math.sin(i * 2.1 + particleTime) * 0.1;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${pAlpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 30% 50%, #0e1525 0%, #0a0f1a 70%)' }}
    />
  );
};

export default NeuralWaveBackground;
