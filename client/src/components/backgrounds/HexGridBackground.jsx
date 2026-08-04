import React, { useEffect, useRef } from 'react';

/**
 * HexGridBackground — For the Company Dashboard
 * Pulsating hexagonal grid with energy ripple effects.
 * Color: emerald + cyan, corporate/structured feel
 */
const HexGridBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let mouseX = -1000, mouseY = -1000;
    let time = 0;
    let ripples = [];

    const hexSize = 35;
    const hexHeight = hexSize * Math.sqrt(3);
    const hexWidth = hexSize * 2;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('mousemove', handleMouse);

    // Auto-ripple generator
    let rippleTimer = 0;

    const drawHex = (cx, cy, size, alpha, strokeColor, fillColor) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008;
      rippleTimer++;

      // Auto ripple
      if (rippleTimer > 120 + Math.random() * 100) {
        rippleTimer = 0;
        ripples.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 0,
          maxRadius: 250 + Math.random() * 150,
          speed: 1.5 + Math.random(),
          life: 1,
        });
      }

      // Update ripples
      ripples = ripples.filter(r => {
        r.radius += r.speed;
        r.life = 1 - r.radius / r.maxRadius;
        return r.life > 0;
      });

      // Draw hex grid
      const cols = Math.ceil(canvas.width / (hexWidth * 0.75)) + 2;
      const rows = Math.ceil(canvas.height / hexHeight) + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * hexWidth * 0.75;
          const y = row * hexHeight + (col % 2 ? hexHeight / 2 : 0);

          // Base visibility
          let alpha = 0.04;

          // Mouse proximity glow
          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const proximity = (200 - dist) / 200;
            alpha += proximity * 0.2;
          }

          // Ripple influence
          for (const r of ripples) {
            const rdx = x - r.x;
            const rdy = y - r.y;
            const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
            const ringDist = Math.abs(rdist - r.radius);
            if (ringDist < 30) {
              const ringGlow = (30 - ringDist) / 30 * r.life;
              alpha += ringGlow * 0.3;
            }
          }

          // Wave pattern
          const wave = Math.sin(x * 0.01 + y * 0.01 + time * 2) * 0.03;
          alpha += wave;

          // Color shifts
          const hue = 160 + Math.sin(x * 0.005 + time) * 20; // emerald to cyan
          const strokeColor = `hsla(${hue}, 70%, 55%, ${alpha})`;

          let fillColor = null;
          if (alpha > 0.1) {
            fillColor = `hsla(${hue}, 60%, 50%, ${(alpha - 0.05) * 0.15})`;
          }

          drawHex(x, y, hexSize - 2, alpha, strokeColor, fillColor);

          // Bright node at hex center for mouse-nearby hexes
          if (dist < 120) {
            const nodeAlpha = (120 - dist) / 120 * 0.5;
            const ng = ctx.createRadialGradient(x, y, 0, x, y, 4);
            ng.addColorStop(0, `hsla(${hue}, 80%, 70%, ${nodeAlpha})`);
            ng.addColorStop(1, `hsla(${hue}, 80%, 70%, 0)`);
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = ng;
            ctx.fill();
          }
        }
      }

      // Draw energy pulse lines along connected hexes near mouse
      if (mouseX > 0) {
        const pulsePhase = time * 5;
        const pulseX = mouseX + Math.cos(pulsePhase) * 100;
        const pulseY = mouseY + Math.sin(pulsePhase) * 100;
        const pg = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 60);
        pg.addColorStop(0, 'hsla(170, 80%, 60%, 0.06)');
        pg.addColorStop(1, 'hsla(170, 80%, 60%, 0)');
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 60, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();
      }

      // Ambient floating particles
      for (let i = 0; i < 15; i++) {
        const pTime = time * 0.6 + i;
        const px = ((Math.sin(i * 5.1 + pTime) + 1) / 2) * canvas.width;
        const py = ((Math.cos(i * 3.3 + pTime * 0.8) + 1) / 2) * canvas.height;
        const ps = 1.2 + Math.sin(pTime * 1.5) * 0.4;
        const pa = 0.12 + Math.sin(pTime) * 0.06;

        ctx.beginPath();
        ctx.arc(px, py, ps, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(170, 70%, 65%, ${pa})`;
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
      style={{ background: 'radial-gradient(ellipse at 60% 40%, #0e1a1a 0%, #0a0f1a 70%)' }}
    />
  );
};

export default HexGridBackground;
