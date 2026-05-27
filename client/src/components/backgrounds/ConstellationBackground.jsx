import React, { useEffect, useRef } from 'react';

/**
 * ConstellationBackground — For the Student Dashboard (most attractive)
 * Stars forming constellation patterns, shooting stars, mouse-reactive gravity.
 * Color: multi-color stars (gold, cyan, electric blue)
 */
const ConstellationBackground = () => {
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
      initStars();
    };

    // Star class
    class Star {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.radius = Math.random() * 2.5 + 0.5;
        this.twinkleSpeed = Math.random() * 2 + 1;
        this.twinkleOffset = Math.random() * Math.PI * 2;
        // Assign color palette
        const palette = [
          { h: 45, s: 90, l: 70 },   // gold
          { h: 190, s: 85, l: 65 },   // cyan
          { h: 220, s: 80, l: 65 },   // electric blue
          { h: 270, s: 70, l: 70 },   // soft violet
          { h: 0, s: 0, l: 90 },      // white
        ];
        this.color = palette[Math.floor(Math.random() * palette.length)];
        this.constellationGroup = Math.floor(Math.random() * 8);
      }
      update() {
        // Gentle drift
        this.x += this.vx;
        this.y += this.vy;

        // Mouse gravity
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250 && dist > 0) {
          const force = (250 - dist) / 250 * 0.3;
          this.x += (dx / dist) * force;
          this.y += (dy / dist) * force;
        }

        // Gentle return to base
        this.x += (this.baseX - this.x) * 0.002;
        this.y += (this.baseY - this.y) * 0.002;

        // Wrap
        if (this.x < -10) { this.x = canvas.width + 10; this.baseX = this.x; }
        if (this.x > canvas.width + 10) { this.x = -10; this.baseX = this.x; }
        if (this.y < -10) { this.y = canvas.height + 10; this.baseY = this.y; }
        if (this.y > canvas.height + 10) { this.y = -10; this.baseY = this.y; }
      }
      draw(t) {
        const twinkle = 0.4 + Math.sin(t * this.twinkleSpeed + this.twinkleOffset) * 0.4;
        const { h, s, l } = this.color;

        // Outer glow
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 5);
        glow.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${twinkle * 0.3})`);
        glow.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core with cross-flare
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * twinkle, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${h}, ${s}%, ${l + 15}%, ${twinkle + 0.2})`;
        ctx.fill();

        // Cross flare for brighter stars
        if (this.radius > 1.8) {
          const flareLen = this.radius * 4 * twinkle;
          ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${twinkle * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(this.x - flareLen, this.y);
          ctx.lineTo(this.x + flareLen, this.y);
          ctx.moveTo(this.x, this.y - flareLen);
          ctx.lineTo(this.x, this.y + flareLen);
          ctx.stroke();
        }
      }
    }

    // Shooting star class
    class ShootingStar {
      constructor() { this.reset(); this.active = false; }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.3;
        const angle = Math.PI * 0.2 + Math.random() * 0.3;
        const speed = 8 + Math.random() * 6;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = 0.015 + Math.random() * 0.01;
        this.trail = [];
        this.active = true;
      }
      update() {
        if (!this.active) return;
        this.trail.push({ x: this.x, y: this.y, life: this.life });
        if (this.trail.length > 25) this.trail.shift();
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        if (this.life <= 0) this.active = false;
      }
      draw() {
        if (!this.active) return;
        for (let i = 0; i < this.trail.length; i++) {
          const t = this.trail[i];
          const progress = i / this.trail.length;
          const alpha = progress * t.life * 0.6;
          const size = progress * 2;
          ctx.beginPath();
          ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        }
        // Head glow
        const hg = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 6);
        hg.addColorStop(0, `rgba(255, 255, 255, ${this.life * 0.8})`);
        hg.addColorStop(0.5, `rgba(180, 220, 255, ${this.life * 0.3})`);
        hg.addColorStop(1, 'rgba(180, 220, 255, 0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = hg;
        ctx.fill();
      }
    }

    let stars = [];
    let shootingStars = [new ShootingStar(), new ShootingStar()];
    let shootTimer = 0;

    function initStars() {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 200);
      stars = Array.from({ length: count }, () => new Star());
    }

    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('mousemove', handleMouse);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;
      shootTimer++;

      // Draw constellation lines (connect nearby stars in same group)
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          if (stars[i].constellationGroup !== stars[j].constellationGroup) continue;
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = 0.06 * (1 - dist / 180);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(150, 200, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      // Mouse constellation web — bright lines to nearest stars
      const mouseDists = stars.map((s, i) => ({
        i, dist: Math.sqrt((s.x - mouseX) ** 2 + (s.y - mouseY) ** 2)
      })).filter(d => d.dist < 200).sort((a, b) => a.dist - b.dist).slice(0, 6);

      for (const d of mouseDists) {
        const s = stars[d.i];
        const alpha = 0.15 * (1 - d.dist / 200);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.moveTo(mouseX, mouseY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      // Update and draw stars
      stars.forEach(s => { s.update(); s.draw(time); });

      // Shooting stars
      shootingStars.forEach(ss => {
        ss.update();
        ss.draw();
      });
      if (shootTimer > 200 + Math.random() * 300) {
        shootTimer = 0;
        const inactive = shootingStars.find(ss => !ss.active);
        if (inactive) inactive.reset();
      }

      // Subtle nebula clouds (very faint)
      for (let i = 0; i < 3; i++) {
        const nx = canvas.width * (0.2 + i * 0.3) + Math.sin(time * 0.3 + i) * 50;
        const ny = canvas.height * (0.3 + i * 0.2) + Math.cos(time * 0.2 + i * 2) * 30;
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, 120);
        const hues = [220, 280, 190];
        ng.addColorStop(0, `hsla(${hues[i]}, 60%, 50%, 0.02)`);
        ng.addColorStop(1, `hsla(${hues[i]}, 60%, 50%, 0)`);
        ctx.beginPath();
        ctx.arc(nx, ny, 120, 0, Math.PI * 2);
        ctx.fillStyle = ng;
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
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #0e1525 0%, #060a14 70%)' }}
    />
  );
};

export default ConstellationBackground;
