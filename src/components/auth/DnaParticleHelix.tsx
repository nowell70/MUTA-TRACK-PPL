import React, { useRef, useEffect, useState } from 'react';

interface Particle {
  id: number;
  rungIndex: number;
  rungT: number; // 0 = Strand A, 1 = Strand B, intermediate for base pairs
  isBackbone: boolean;
  colorType: 'blue' | 'red';
  baseX: number;
  baseY: number;
  baseZ: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export const DnaParticleHelix: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rotationRef = useRef<number>(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Check prefers-reduced-motion
  const prefersReducedMotionRef = useRef(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotionRef.current = media.matches;
      const listener = (e: MediaQueryListEvent) => {
        prefersReducedMotionRef.current = e.matches;
      };
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Build particles
    const buildParticles = (width: number, height: number) => {
      const particles: Particle[] = [];
      const numRungs = 26; // ~2.5 full helical turns
      const verticalPadding = 28;
      const availableHeight = height - verticalPadding * 2;
      const rungSpacing = availableHeight / (numRungs - 1);
      const helixRadius = Math.min(width * 0.28, 90);
      const centerX = width / 2;

      let idCounter = 0;

      for (let i = 0; i < numRungs; i++) {
        const yPos = verticalPadding + i * rungSpacing;
        // Phase angle: 2.6 full rotations (5.2 * PI)
        const angle = (i / (numRungs - 1)) * Math.PI * 5.2;

        // Backbone A (Blue strand)
        particles.push({
          id: idCounter++,
          rungIndex: i,
          rungT: 0,
          isBackbone: true,
          colorType: 'blue',
          baseX: centerX + Math.cos(angle) * helixRadius,
          baseY: yPos,
          baseZ: Math.sin(angle),
          x: centerX + Math.cos(angle) * helixRadius,
          y: yPos,
          vx: 0,
          vy: 0,
          radius: 4.2,
        });

        // Backbone B (Red strand, 180 deg phase shift)
        const angleB = angle + Math.PI;
        particles.push({
          id: idCounter++,
          rungIndex: i,
          rungT: 1,
          isBackbone: true,
          colorType: 'red',
          baseX: centerX + Math.cos(angleB) * helixRadius,
          baseY: yPos,
          baseZ: Math.sin(angleB),
          x: centerX + Math.cos(angleB) * helixRadius,
          y: yPos,
          vx: 0,
          vy: 0,
          radius: 4.2,
        });

        // Base pair rungs: 4 discrete circular particles between Strand A and Strand B
        const intermediateSteps = [0.2, 0.4, 0.6, 0.8];
        intermediateSteps.forEach((t) => {
          // Linear interpolation between the two strand positions on this rung
          const isBlueSide = t < 0.5;
          particles.push({
            id: idCounter++,
            rungIndex: i,
            rungT: t,
            isBackbone: false,
            colorType: isBlueSide ? 'blue' : 'red',
            baseX: centerX, // calculated dynamically in loop
            baseY: yPos,
            baseZ: 0,
            x: centerX,
            y: yPos,
            vx: 0,
            vy: 0,
            radius: 2.8,
          });
        });
      }

      particlesRef.current = particles;
    };

    let width = container.clientWidth || 320;
    let height = container.clientHeight || 420;

    const setCanvasSize = () => {
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      width = container.clientWidth || 320;
      height = container.clientHeight || 420;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      buildParticles(width, height);
    };

    setCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      setCanvasSize();
    });
    resizeObserver.observe(container);

    // Render loop
    const render = () => {
      if (!ctx || !canvas) return;

      // Clear canvas with transparent clear
      ctx.clearRect(0, 0, width, height);

      // Increment rotation slowly if reduced motion is disabled
      if (!prefersReducedMotionRef.current) {
        rotationRef.current += 0.007;
      }
      const rotation = rotationRef.current;

      const numRungs = 26;
      const verticalPadding = 28;
      const availableHeight = height - verticalPadding * 2;
      const rungSpacing = availableHeight / (numRungs - 1);
      const helixRadius = Math.min(width * 0.28, 90);
      const centerX = width / 2;

      // Update base positions according to rotation
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const rungAngle = (p.rungIndex / (numRungs - 1)) * Math.PI * 5.2 + rotation;
        const yPos = verticalPadding + p.rungIndex * rungSpacing;

        const xA = centerX + Math.cos(rungAngle) * helixRadius;
        const zA = Math.sin(rungAngle);
        const xB = centerX + Math.cos(rungAngle + Math.PI) * helixRadius;
        const zB = Math.sin(rungAngle + Math.PI);

        if (p.isBackbone) {
          if (p.rungT === 0) {
            p.baseX = xA;
            p.baseY = yPos;
            p.baseZ = zA;
          } else {
            p.baseX = xB;
            p.baseY = yPos;
            p.baseZ = zB;
          }
        } else {
          // Intermediate particle along rung
          p.baseX = xA + (xB - xA) * p.rungT;
          p.baseY = yPos;
          p.baseZ = zA + (zB - zA) * p.rungT;
        }

        // Spring physics: return towards (baseX, baseY)
        const springK = 0.06;
        const damping = 0.86;

        const dx = p.baseX - p.x;
        const dy = p.baseY - p.y;

        p.vx = (p.vx + dx * springK) * damping;
        p.vy = (p.vy + dy * springK) * damping;

        p.x += p.vx;
        p.y += p.vy;

        // Snapping threshold when almost at rest to avoid micro-jitters
        if (Math.abs(p.x - p.baseX) < 0.04 && Math.abs(p.vx) < 0.04) {
          p.x = p.baseX;
          p.vx = 0;
        }
        if (Math.abs(p.y - p.baseY) < 0.04 && Math.abs(p.vy) < 0.04) {
          p.y = p.baseY;
          p.vy = 0;
        }
      }

      // Draw faint base pair connecting lines between particles of each rung
      for (let r = 0; r < numRungs; r++) {
        const rungParticles = particles
          .filter((p) => p.rungIndex === r)
          .sort((a, b) => a.rungT - b.rungT);

        if (rungParticles.length >= 2) {
          ctx.beginPath();
          const first = rungParticles[0];
          const last = rungParticles[rungParticles.length - 1];
          ctx.moveTo(first.x, first.y);
          ctx.lineTo(last.x, last.y);

          // Subtle rung bridge line
          const avgZ = (first.baseZ + last.baseZ) / 2;
          const lineAlpha = 0.12 + 0.12 * (avgZ + 1) * 0.5;
          ctx.strokeStyle = `rgba(148, 163, 184, ${lineAlpha.toFixed(2)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Sort particles by baseZ (draw back particles first, front particles last for 3D depth)
      const sortedParticles = [...particles].sort((a, b) => a.baseZ - b.baseZ);

      // Render each particle as a crisp circular dot
      for (let i = 0; i < sortedParticles.length; i++) {
        const p = sortedParticles[i];

        // 3D depth scaling: baseZ is [-1, 1]
        // zNorm: 0 (far) to 1 (near)
        const zNorm = (p.baseZ + 1) / 2;
        const scale = 0.72 + 0.38 * zNorm;
        const r = p.radius * scale;
        const alpha = 0.4 + 0.58 * zNorm;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.5, r), 0, Math.PI * 2);

        if (p.colorType === 'blue') {
          // Blue strand: Cobalt & bright cyan-blue shades
          if (p.isBackbone) {
            ctx.fillStyle = `rgba(37, 99, 235, ${alpha.toFixed(2)})`; // blue-600
          } else {
            ctx.fillStyle = `rgba(59, 130, 246, ${(alpha * 0.9).toFixed(2)})`; // blue-500
          }
        } else {
          // Red strand: Ruby / crimson shades
          if (p.isBackbone) {
            ctx.fillStyle = `rgba(220, 38, 38, ${alpha.toFixed(2)})`; // red-600
          } else {
            ctx.fillStyle = `rgba(239, 68, 68, ${(alpha * 0.9).toFixed(2)})`; // red-500
          }
        }

        ctx.fill();

        // Subtle core highlight on near backbone particles
        if (p.isBackbone && zNorm > 0.6) {
          ctx.beginPath();
          ctx.arc(p.x - r * 0.25, p.y - r * 0.25, r * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${(0.45 * zNorm).toFixed(2)})`;
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  // Pointer Interaction: Click or Tap to perturb particles outward organically
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setHasInteracted(true);

    const particles = particlesRef.current;
    const impactRadius = 110; // Influence radius in pixels
    const maxImpulse = 11; // Max pixel displacement velocity

    particles.forEach((p) => {
      const dx = p.x - clickX;
      const dy = p.y - clickY;
      const dist = Math.hypot(dx, dy);

      if (dist < impactRadius) {
        // Falloff factor from 1 at epicenter to 0 at edge
        const factor = 1 - dist / impactRadius;
        const impulse = factor * maxImpulse;

        // Outward angle with small organic variation
        const jitter = (Math.random() - 0.5) * 0.25;
        const angle = Math.atan2(dy, dx) + jitter;

        p.vx += Math.cos(angle) * impulse;
        p.vy += Math.sin(angle) * impulse;
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[320px] sm:h-[380px] lg:h-[420px] flex items-center justify-center select-none"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        className="w-full h-full cursor-pointer touch-none"
        title="Click to interact with DNA particles"
        aria-label="Interactive DNA double helix particle visual"
      />

      {/* Subtle interaction micro-indicator */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none text-center">
        <span className="text-[10px] tracking-wide text-slate-400 dark:text-slate-500 font-mono transition-opacity">
          {hasInteracted ? '• DNA elastic lattice active •' : 'Click or tap DNA helix to perturb'}
        </span>
      </div>
    </div>
  );
};
