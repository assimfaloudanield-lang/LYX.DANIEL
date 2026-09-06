import { useEffect, useRef } from 'react';
import type { StarParticle, TouchTrailPoint } from '../types';
import { sounds } from '../utils/audio';

interface GalaxyCanvasProps {
  isOn: boolean;
  powerTransition?: number; // Optional for backward compatibility
}

const ARM_COUNT = 3;
const TOTAL_STARS = 1800;

export function GalaxyCanvas({ isOn }: GalaxyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stateRef = useRef({
    stars: [] as StarParticle[],
    touchTrails: [] as TouchTrailPoint[],
    pointer: {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
      isDown: false,
    },
    rotation: 0,
    shockwaves: [] as { x: number; y: number; radius: number; maxRadius: number; alpha: number }[],
    isOn,
    currentPower: isOn ? 1.0 : 0.08,
    targetPower: isOn ? 1.0 : 0.08,
  });

  // Atualiza alvo de potência e efeito de shockwave suavemente ao ligar/desligar
  useEffect(() => {
    stateRef.current.isOn = isOn;
    stateRef.current.targetPower = isOn ? 1.0 : 0.08;

    if (canvasRef.current) {
      const cx = canvasRef.current.width / (2 * (window.devicePixelRatio || 1));
      const cy = canvasRef.current.height / (2 * (window.devicePixelRatio || 1));
      stateRef.current.shockwaves.push({
        x: cx,
        y: cy,
        radius: 10,
        maxRadius: Math.max(cx, cy) * 1.5,
        alpha: isOn ? 1.0 : 0.6,
      });
    }
  }, [isOn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const colors = [
      '#60a5fa', // Electric blue
      '#a855f7', // Vivid purple
      '#38bdf8', // Cyan
      '#ec4899', // Pink
      '#f59e0b', // Amber/gold
      '#ffffff', // Pure white
      '#c084fc', // Bright lavender
    ];

    const initGalaxy = (w: number, h: number) => {
      const maxRadius = Math.hypot(w, h) * 0.52;
      const stars: StarParticle[] = [];

      for (let i = 0; i < TOTAL_STARS; i++) {
        // Logarithmic spiral distribution
        const armIndex = i % ARM_COUNT;
        const armOffset = (armIndex * (2 * Math.PI)) / ARM_COUNT;

        // Exponential distribution: denser near center
        const p = Math.pow(Math.random(), 1.8);
        const distance = 15 + p * maxRadius;

        // Spiral angle with random scatter
        const angle = distance * 0.005 + armOffset + (Math.random() - 0.5) * (0.8 + (distance / maxRadius) * 0.5);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() < 0.08 ? Math.random() * 2.6 + 1.8 : Math.random() * 1.8 + 0.6;
        const speed = (0.0018 + (1 - distance / maxRadius) * 0.0035) * (Math.random() * 0.3 + 0.85);

        stars.push({
          x: 0,
          y: 0,
          baseRadius: distance,
          radius: distance,
          angle,
          distance,
          speed,
          armOffset,
          color,
          alpha: Math.random() * 0.22 + 0.08,
          baseAlpha: Math.random() * 0.22 + 0.08,
          size,
          vx: 0,
          vy: 0,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      stateRef.current.stars = stars;
    };

    let currentWidth = window.innerWidth;
    let currentHeight = window.innerHeight;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || canvas.clientWidth || window.innerWidth;
      const h = rect.height || canvas.clientHeight || window.innerHeight;
      currentWidth = w;
      currentHeight = h;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
      initGalaxy(w, h);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(canvas);

    // Pointer events for finger movement & swipe trails
    let lastAudioTime = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const p = stateRef.current.pointer;
      const vx = p.prevX !== -1000 ? x - p.prevX : 0;
      const vy = p.prevY !== -1000 ? y - p.prevY : 0;

      p.vx = vx;
      p.vy = vy;
      p.prevX = p.x;
      p.prevY = p.y;
      p.x = x;
      p.y = y;

      const speed = Math.hypot(vx, vy);

      // Soft cosmic chime on fast finger swipe
      const now = performance.now();
      if (speed > 5 && now - lastAudioTime > 140 && stateRef.current.isOn) {
        sounds.playTouchChime(speed);
        lastAudioTime = now;
      }

      // Add touch trail stardust particles following the finger
      if (speed > 0.8) {
        const count = Math.min(Math.floor(speed * 0.35) + 1, 6);
        for (let i = 0; i < count; i++) {
          const trailColor = colors[Math.floor(Math.random() * colors.length)];
          const spread = 16;
          stateRef.current.touchTrails.push({
            x: x + (Math.random() - 0.5) * spread,
            y: y + (Math.random() - 0.5) * spread,
            vx: -vx * 0.15 + (Math.random() - 0.5) * 1.5,
            vy: -vy * 0.15 + (Math.random() - 0.5) * 1.5,
            life: 1.0,
            maxLife: 32 + Math.random() * 20,
            size: Math.random() * 2.6 + 1.2,
            color: trailColor,
          });
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      stateRef.current.pointer.isDown = true;
      handlePointerMove(e);
    };

    const handlePointerUp = () => {
      stateRef.current.pointer.isDown = false;
      stateRef.current.pointer.x = -1000;
      stateRef.current.pointer.y = -1000;
      stateRef.current.pointer.prevX = -1000;
      stateRef.current.pointer.prevY = -1000;
    };

    canvas.addEventListener('pointermove', handlePointerMove, { passive: true });
    canvas.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    // Render loop
    const render = () => {
      const w = currentWidth;
      const h = currentHeight;
      const cx = w * 0.5;
      const cy = h * 0.5;

      const pState = stateRef.current;

      // Interpolação suave e contínua via requestAnimationFrame
      const powerDiff = pState.targetPower - pState.currentPower;
      if (Math.abs(powerDiff) > 0.0002) {
        pState.currentPower += powerDiff * 0.055;
      } else {
        pState.currentPower = pState.targetPower;
      }
      const powerTransition = pState.currentPower;
      const currentIsOn = pState.isOn;

      // Clear canvas each frame to reveal background image
      ctx.clearRect(0, 0, w, h);

      // Subtle atmosphere tint over background (darker when off, clearer when on)
      ctx.globalCompositeOperation = 'source-over';
      const bgDim = currentIsOn ? 0.28 : 0.48;
      ctx.fillStyle = `rgba(1, 0, 8, ${bgDim})`;
      ctx.fillRect(0, 0, w, h);

      // Core galactic ambient nebula glow - dark & deep
      if (powerTransition > 0.05) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.65);
        coreGradient.addColorStop(0, `rgba(130, 60, 220, ${0.05 * powerTransition})`);
        coreGradient.addColorStop(0.3, `rgba(45, 95, 210, ${0.03 * powerTransition})`);
        coreGradient.addColorStop(0.65, `rgba(180, 45, 130, ${0.012 * powerTransition})`);
        coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = coreGradient;
        ctx.fillRect(0, 0, w, h);

        // Subtle dark core hotspot
        const hotSpot = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
        hotSpot.addColorStop(0, `rgba(255, 255, 255, ${0.12 * powerTransition})`);
        hotSpot.addColorStop(0.4, `rgba(147, 197, 253, ${0.05 * powerTransition})`);
        hotSpot.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = hotSpot;
        ctx.beginPath();
        ctx.arc(cx, cy, 60, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Render shockwaves from toggle
      if (pState.shockwaves.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = pState.shockwaves.length - 1; i >= 0; i--) {
          const sw = pState.shockwaves[i];
          sw.radius += 12;
          sw.alpha *= 0.93;

          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(147, 197, 253, ${sw.alpha * 0.4})`;
          ctx.lineWidth = 3 * (1 - sw.radius / sw.maxRadius) + 1;
          ctx.stroke();

          if (sw.alpha < 0.01 || sw.radius > sw.maxRadius) {
            pState.shockwaves.splice(i, 1);
          }
        }
        ctx.restore();
      }

      // Update and render galaxy stars
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Smooth rotation proportional to interpolated power
      const rotationSpeed = 0.0002 + 0.001 * powerTransition;
      pState.rotation += rotationSpeed;

      const p = pState.pointer;
      const pointerActive = p.x !== -1000;
      const touchRadius = 220;

      for (let i = 0; i < pState.stars.length; i++) {
        const star = pState.stars[i];

        // Orbit update
        const currentSpeed = star.speed * (0.2 + 0.8 * powerTransition);
        star.angle += currentSpeed;
        star.pulsePhase += 0.025;

        // Base galactic coordinate with perspective tilt
        const targetX = cx + Math.cos(star.angle + pState.rotation) * star.radius;
        const targetY = cy + Math.sin(star.angle + pState.rotation) * (star.radius * 0.65);

        // Interaction when finger moves across
        if (pointerActive) {
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < touchRadius && dist > 1) {
            const force = 1 - dist / touchRadius;
            const normalX = -dy / dist;
            const normalY = dx / dist;

            star.vx += (normalX * 2.2 + p.vx * 0.1) * force + (dx / dist) * force * 1.2;
            star.vy += (normalY * 2.2 + p.vy * 0.1) * force + (dy / dist) * force * 1.2;
          }
        }

        // Return to orbit with gentle friction
        star.vx *= 0.92;
        star.vy *= 0.92;

        star.x = targetX + star.vx;
        star.y = targetY + star.vy;

        // Star luminosity - darker and subtle
        const twinkle = Math.sin(star.pulsePhase) * 0.2 + 0.8;
        const activeAlpha = Math.max(0.02, star.baseAlpha * powerTransition * twinkle * 0.5);
        const starSize = star.size * (0.6 + 0.35 * powerTransition);

        ctx.fillStyle = star.color;
        ctx.globalAlpha = activeAlpha;

        ctx.beginPath();
        ctx.arc(star.x, star.y, starSize, 0, Math.PI * 2);
        ctx.fill();

        // Extra soft subtle glow for larger stars only
        if (star.size > 2.0 && powerTransition > 0.4) {
          ctx.globalAlpha = activeAlpha * 0.15;
          ctx.beginPath();
          ctx.arc(star.x, star.y, starSize * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // Render finger passing animation: glowing stardust trails
      if (pState.touchTrails.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (let i = pState.touchTrails.length - 1; i >= 0; i--) {
          const pt = pState.touchTrails[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vx *= 0.94;
          pt.vy *= 0.94;
          pt.life -= 1 / pt.maxLife;

          if (pt.life <= 0) {
            pState.touchTrails.splice(i, 1);
            continue;
          }

          const trailAlpha = pt.life * 0.55 * (0.3 + 0.7 * powerTransition);
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = trailAlpha;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
          ctx.fill();

          // Soft aura around trail particle
          ctx.globalAlpha = trailAlpha * 0.25;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * pt.life * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="galaxy-canvas"
      className="absolute inset-0 w-full h-full select-none pointer-events-auto touch-none"
      style={{ display: 'block' }}
    />
  );
}
