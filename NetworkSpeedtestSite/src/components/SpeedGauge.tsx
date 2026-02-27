import { useEffect, useRef } from 'react';

interface SpeedGaugeProps {
  speed: number;
  maxSpeed?: number;
  label: string;
  unit: string;
  color: string;
  isActive?: boolean;
}

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({
  speed,
  maxSpeed = 1000,
  label,
  unit,
  color,
  isActive = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const currentSpeedRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    const animate = () => {
      // Smooth speed transition
      const targetSpeed = speed;
      const diff = targetSpeed - currentSpeedRef.current;
      currentSpeedRef.current += diff * 0.1;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Background arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 2.25);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Progress arc
      const percentage = Math.min(currentSpeedRef.current / maxSpeed, 1);
      const endAngle = Math.PI * 0.75 + percentage * (Math.PI * 1.5);

      const gradient = ctx.createLinearGradient(
        centerX - radius,
        centerY,
        centerX + radius,
        centerY
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, adjustBrightness(color, 30));

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI * 0.75, endAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow effect when active
      if (isActive) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI * 0.75, endAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Tick marks
      for (let i = 0; i <= 10; i++) {
        const angle = Math.PI * 0.75 + (i / 10) * Math.PI * 1.5;
        const innerRadius = radius - 20;
        const outerRadius = radius - 8;

        ctx.beginPath();
        ctx.moveTo(
          centerX + Math.cos(angle) * innerRadius,
          centerY + Math.sin(angle) * innerRadius
        );
        ctx.lineTo(
          centerX + Math.cos(angle) * outerRadius,
          centerY + Math.sin(angle) * outerRadius
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      const frameId = requestAnimationFrame(animate);
      animationRef.current = frameId;
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, maxSpeed, color, isActive]);

  const displaySpeed = Math.round(currentSpeedRef.current * 10) / 10;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl font-bold text-white tabular-nums">
            {displaySpeed.toFixed(1)}
          </span>
          <span className="text-sm text-white/60 mt-1">{unit}</span>
        </div>
      </div>
      <span className="text-lg font-medium text-white/80 mt-4">{label}</span>
    </div>
  );
};

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
