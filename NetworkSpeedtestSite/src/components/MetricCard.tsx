import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  delay?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  color,
  delay = 0,
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:scale-105"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider">{label}</p>
          <p className="text-lg font-semibold text-white">
            {value}
            {unit && <span className="text-sm text-white/60 ml-1">{unit}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};
