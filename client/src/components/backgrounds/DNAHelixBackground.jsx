import React, { useEffect, useRef } from 'react';

/**
 * DNAHelixBackground — For the Register page
 * Rotating double-helix strands with connecting rungs.
 * Color: violet + purple, symbolizes creation/joining
 */
const DNAHelixBackground = () => {
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

    // Helix parameters
    const helixCount = 3;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.012;

      for (let h = 0; h < helixCount; h++) {
        const centerX = canvas.width * (0.25 + h * 0.25);
        const helixWidth = 50 + h * 15;
        const verticalStep = 8;
        const rotationSpeed = time * (0.8 + h * 0.2);
        const hueBase = 260 + h * 20; // violet spectrum

        const strand1 = [];
        const strand2 = [];

        for (let y = -30; y < canvas.height + 30; y += verticalStep) {
          const phase = y * 0.02 + rotationSpeed;

          // Mouse influence on helix center
          const dy = y - mouseY;
          const dx = centerX - mouseX;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mouseInfluence = dist < 200 ? (200 - dist) / 200 : 0;
          const xOffset = mouseInfluence * dx * 0.15;

          const x1 = centerX + Math.sin(phase) * helixWidth + xOffset;
          const x2 = centerX + Math.sin(phase + Math.PI) * helixWidth + xOffset;

          // Z-depth simulation
          const z1 = Math.cos(phase);
          const z2 = Math.cos(phase + Math.PI);

          strand1.push({ x: x1, y, z: z1 });
          strand2.push({ x: x2, y, z: z2 });
        }

        // Draw connecting rungs (base pairs)
        for (let i = 0; i < strand1.length; i += 3) {
          const s1 = strand1[i];
          const s2 = strand2[i];
          const zAvg = (s1.z + s2.z) / 2;
          const rungAlpha = 0.06 + Math.abs(zAvg) * 0.08;

          // Mouse proximity brightness
          const mdx = (s1.x + s2.x) / 2 - mouseX;
          const mdy = s1.y - mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          const glow = mdist < 150 ? (150 - mdist) / 150 : 0;

          ctx.beginPath();
          ctx.strokeStyle = `hsla(${hueBase + 30}, 70%, 65%, ${rungAlpha + glow * 0.15})`;
          ctx.lineWidth = 1 + glow * 1.5;
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(s2.x, s2.y);
          ctx.stroke();

          // Rung midpoint glow
          if (glow > 0.3) {
            const mx = (s1.x + s2.x) / 2;
            const my = (s1.y + s2.y) / 2;
            const rg = ctx.createRadialGradient(mx, my, 0, mx, my, 8);
            rg.addColorStop(0, `hsla(${hueBase + 40}, 80%, 70%, ${glow * 0.3})`);
            rg.addColorStop(1, `hsla(${hueBase + 40}, 80%, 70%, 0)`);
            ctx.beginPath();
            ctx.arc(mx, my, 8, 0, Math.PI * 2);
            ctx.fillStyle = rg;
            ctx.fill();
          }
        }

        // Draw strands
        [strand1, strand2].forEach((strand, si) => {
          ctx.beginPath();
          for (let i = 0; i < strand.length; i++) {
            const p = strand[i];
            const alpha = 0.15 + (p.z + 1) / 2 * 0.25;
            if (i === 0) {
              ctx.moveTo(p.x, p.y);
            } else {
              ctx.lineTo(p.x, p.y);
            }
          }
          ctx.strokeStyle = `hsla(${hueBase + si * 25}, 75%, 60%, 0.2)`;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Nodes at intervals
          for (let i = 0; i < strand.length; i += 4) {
            const p = strand[i];
            const depth = (p.z + 1) / 2;
            const nodeSize = 1.5 + depth * 2;
            const nodeAlpha = 0.2 + depth * 0.4;

            // Mouse glow
            const ndx = p.x - mouseX;
            const ndy = p.y - mouseY;
            const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
            const nGlow = ndist < 120 ? (120 - ndist) / 120 : 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, nodeSize + nGlow * 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hueBase + si * 30}, 80%, 70%, ${nodeAlpha + nGlow * 0.3})`;
            ctx.fill();

            if (nGlow > 0.2) {
              const ng = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, nodeSize * 4);
              ng.addColorStop(0, `hsla(${hueBase + si * 30}, 85%, 75%, ${nGlow * 0.3})`);
              ng.addColorStop(1, `hsla(${hueBase + si * 30}, 85%, 75%, 0)`);
              ctx.beginPath();
              ctx.arc(p.x, p.y, nodeSize * 4, 0, Math.PI * 2);
              ctx.fillStyle = ng;
              ctx.fill();
            }
          }
        });
      }

      // Floating phosphor particles
      for (let i = 0; i < 25; i++) {
        const pTime = time * 0.4 + i;
        const px = ((Math.sin(i * 4.1 + pTime) + 1) / 2) * canvas.width;
        const py = ((Math.cos(i * 2.7 + pTime * 0.6) + 1) / 2) * canvas.height;
        const ps = 1 + Math.sin(pTime * 2) * 0.5;
        const pa = 0.1 + Math.sin(pTime * 1.5) * 0.08;

        ctx.beginPath();
        ctx.arc(px, py, ps, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(280, 70%, 75%, ${pa})`;
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
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #120e25 0%, #0a0f1a 70%)' }}
    />
  );
};

export default DNAHelixBackground;
