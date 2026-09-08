import React, { useEffect, useRef } from 'react';

export const CinematicBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Nodes in the AI Production Network
    const nodeLabels = [
      'SCRIPT',
      'CASTING',
      'CHARACTER',
      'LOCATION',
      'WEATHER',
      'RESEARCH',
      'SCHEDULING',
      'CONTINUITY'
    ];

    const nodes = nodeLabels.map((label, idx) => {
      const angle = (idx / nodeLabels.length) * Math.PI * 2;
      const distance = Math.min(width, height) * (width < 640 ? 0.32 : 0.28);
      return {
        label,
        baseX: width / 2 + Math.cos(angle) * distance,
        baseY: height * 0.42 + Math.sin(angle) * distance * 0.65,
        x: width / 2 + Math.cos(angle) * distance,
        y: height * 0.42 + Math.sin(angle) * distance * 0.65,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        pulseOffset: Math.random() * Math.PI * 2,
        color: idx % 2 === 0 ? '#38bdf8' : '#f59e0b'
      };
    });

    const hub = {
      label: 'MOVIEOS',
      x: width / 2,
      y: height * 0.42
    };

    // Background floating particles
    const particleCount = width < 640 ? 25 : 50;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      speedY: (Math.random() * 0.2 + 0.05) * -1
    }));

    let pulseTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      hub.x = width / 2;
      hub.y = height * 0.42;

      // Render subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = width < 640 ? 40 : 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw floating particles
      particles.forEach((p) => {
        if (!prefersReducedMotion) {
          p.y += p.speedY;
          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.fill();
      });

      pulseTime += 0.015;

      // Update & Draw Nodes
      nodes.forEach((node, i) => {
        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          // Tether to base position
          const dx = node.baseX - node.x;
          const dy = node.baseY - node.y;
          node.vx += dx * 0.001;
          node.vy += dy * 0.001;
        }

        // Draw connecting line from Node to MOVIEOS Hub
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(hub.x, hub.y);
        const grad = ctx.createLinearGradient(node.x, node.y, hub.x, hub.y);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0.25)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Animated signal pulse along connection line
        if (!prefersReducedMotion) {
          const progress = (pulseTime + i * 0.3) % 1;
          const pulseX = node.x + (hub.x - node.x) * progress;
          const pulseY = node.y + (hub.y - node.y) * progress;

          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Outer node glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();

        // Node halo
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Hub Node (MOVIEOS)
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 14 + Math.sin(pulseTime * 2) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-opacity duration-1000"
    />
  );
};
