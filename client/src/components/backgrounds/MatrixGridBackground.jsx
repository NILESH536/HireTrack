import React, { useEffect, useRef } from 'react';

/**
 * MatrixGridBackground — For the Admin Dashboard
 * Radar sweep with data points, orbital rings, scanning lines.
 * Color: amber + orange, command center aesthetic
 */
const MatrixGridBackground = () => {
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

    // Data nodes that appear on the grid
    class DataNode {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.size = 2 + Math.random() * 2;
        this.type = Math.floor(Math.random() * 3); // 0: normal, 1: alert, 2: active
        this.scanHighlight = 0;
      }
    }

    const nodeCount = 40;
    const nodes = Array.from({ length: nodeCount }, () => new DataNode());

    // Radar centers
    const radarCenters = [
      { x: 0.2, y: 0.3 },
      { x: 0.75, y: 0.6 },
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.006;

      const sweepAngle = (time * 2) % (Math.PI * 2);

      // Draw grid lines
      const gridSpacing = 60;
      ctx.lineWidth = 0.3;

      // Vertical grid
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        const dx = Math.abs(x - mouseX);
        const proximity = dx < 100 ? (100 - dx) / 100 : 0;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.03 + proximity * 0.06})`;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal grid
      for (let y = 0; y < canvas.height; y += gridSpacing) {
        const dy = Math.abs(y - mouseY);
        const proximity = dy < 100 ? (100 - dy) / 100 : 0;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.03 + proximity * 0.06})`;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw radar sweeps
      radarCenters.forEach((center, ci) => {
        const cx = canvas.width * center.x;
        const cy = canvas.height * center.y;
        const maxRadius = 200 + ci * 50;
        const sweep = sweepAngle + ci * Math.PI * 0.7;

        // Orbital rings
        [0.3, 0.6, 1.0].forEach(ring => {
          const r = maxRadius * ring;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 158, 11, 0.06)`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });

        // Cross-hairs at center
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
        ctx.lineWidth = 0.5;
        ctx.moveTo(cx - 15, cy);
        ctx.lineTo(cx + 15, cy);
        ctx.moveTo(cx, cy - 15);
        ctx.lineTo(cx, cy + 15);
        ctx.stroke();

        // Radar sweep cone
        const sweepSpan = 0.4;
        const gradient = ctx.createConicGradient(sweep - sweepSpan, cx, cy);
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0)');
        gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.06)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius, sweep - sweepSpan, sweep + sweepSpan);
        ctx.lineTo(cx, cy);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Sweep edge line
        const edgeX = cx + Math.cos(sweep) * maxRadius;
        const edgeY = cy + Math.sin(sweep) * maxRadius;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(edgeX, edgeY);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Check if sweep hits nodes
        nodes.forEach(node => {
          const ndx = node.x - cx;
          const ndy = node.y - cy;
          const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
          if (ndist < maxRadius) {
            const nodeAngle = Math.atan2(ndy, ndx);
            const angleDiff = Math.abs(((nodeAngle - sweep + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
            if (angleDiff < 0.2) {
              node.scanHighlight = 1;
            }
          }
        });
      });

      // Draw data nodes
      nodes.forEach(node => {
        const pulse = Math.sin(time * 3 + node.pulsePhase) * 0.5 + 0.5;

        // Decay scan highlight
        node.scanHighlight *= 0.97;

        // Mouse proximity
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseGlow = dist < 150 ? (150 - dist) / 150 : 0;

        const totalGlow = Math.min(node.scanHighlight + mouseGlow, 1);

        // Node colors based on type
        const colors = [
          { h: 38, s: 92, l: 50 },  // amber
          { h: 0, s: 70, l: 55 },    // red/alert
          { h: 140, s: 70, l: 50 },   // green/active
        ];
        const c = colors[node.type];

        // Glow ring
        if (totalGlow > 0.1) {
          const rg = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 6);
          rg.addColorStop(0, `hsla(${c.h}, ${c.s}%, ${c.l}%, ${totalGlow * 0.4})`);
          rg.addColorStop(1, `hsla(${c.h}, ${c.s}%, ${c.l}%, 0)`);
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size * 6, 0, Math.PI * 2);
          ctx.fillStyle = rg;
          ctx.fill();

          // Bracket markers
          const bSize = node.size * 3;
          const bGap = node.size;
          ctx.strokeStyle = `hsla(${c.h}, ${c.s}%, ${c.l}%, ${totalGlow * 0.5})`;
          ctx.lineWidth = 1;

          // Top-left bracket
          ctx.beginPath();
          ctx.moveTo(node.x - bSize, node.y - bGap);
          ctx.lineTo(node.x - bSize, node.y - bSize);
          ctx.lineTo(node.x - bGap, node.y - bSize);
          ctx.stroke();

          // Bottom-right bracket
          ctx.beginPath();
          ctx.moveTo(node.x + bSize, node.y + bGap);
          ctx.lineTo(node.x + bSize, node.y + bSize);
          ctx.lineTo(node.x + bGap, node.y + bSize);
          ctx.stroke();
        }

        // Core dot
        const baseAlpha = 0.2 + pulse * 0.15 + totalGlow * 0.4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * (1 + totalGlow * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${c.h}, ${c.s}%, ${c.l + 10}%, ${baseAlpha})`;
        ctx.fill();
      });

      // Horizontal scanning line
      const scanY = (Math.sin(time * 1.5) + 1) / 2 * canvas.height;
      const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      scanGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
      scanGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.03)');
      scanGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 30, canvas.width, 60);

      // Mouse ping effect
      if (mouseX > 0) {
        const pingRadius = ((time * 10) % 3) * 40;
        const pingAlpha = 0.15 * (1 - pingRadius / 120);
        if (pingAlpha > 0) {
          ctx.beginPath();
          ctx.arc(mouseX, mouseY, pingRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 158, 11, ${pingAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
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
      style={{ background: 'radial-gradient(ellipse at 40% 50%, #1a1510 0%, #0a0f1a 70%)' }}
    />
  );
};

export default MatrixGridBackground;
