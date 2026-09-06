import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  currentAlpha: number;
  alphaSpeed: number;
  vx: number;
  vy: number;
  color: string;
  glowRadius: number;
  phase: number;
}

export const CosmicFloatingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const colors = [
      'rgba(92, 225, 255, ',   // Ciano suave
      'rgba(168, 85, 247, ',   // Roxo cósmico
      'rgba(236, 72, 153, ',   // Rosa estelar
      'rgba(232, 238, 248, ',  // Branco puro estelar
      'rgba(123, 92, 255, ',   // Azul violeta
    ];

    const particleCount = 38;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      const radius = Math.random() * 1.8 + 0.6;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        baseAlpha: Math.random() * 0.4 + 0.2,
        currentAlpha: Math.random() * 0.5 + 0.1,
        alphaSpeed: Math.random() * 0.015 + 0.005,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.35 + 0.1), // Flutua suavemente para cima
        color: colorBase,
        glowRadius: radius * (Math.random() * 4 + 3),
        phase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Movimento suave com oscilação orgânica
        p.x += p.vx + Math.sin(time + p.phase) * 0.15;
        p.y += p.vy;

        // Pulsação de brilho suave
        p.currentAlpha = p.baseAlpha + Math.sin(time * 1.5 + p.phase) * 0.2;
        const alpha = Math.max(0.05, Math.min(0.85, p.currentAlpha));

        // Reenquadramento suave ao sair da tela
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Desenhar glow suave da partícula
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.glowRadius
        );
        gradient.addColorStop(0, `${p.color}${alpha})`);
        gradient.addColorStop(0.5, `${p.color}${alpha * 0.35})`);
        gradient.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo brilhante da partícula
        ctx.fillStyle = `${p.color}${Math.min(1, alpha + 0.2)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 pointer-events-none w-full h-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
