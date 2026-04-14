import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface MacroProgressProps {
  label: string;
  consumed: number;
  target: number;
  color: 'emerald' | 'blue' | 'amber' | 'rose';
  unit?: string;
}

export const MacroProgress: React.FC<MacroProgressProps> = ({ 
  label, consumed, target, color, unit = 'g' 
}) => {
  const percentage = Math.min(100, Math.round((consumed / target) * 100)) || 0;
  
  const colorClasses = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  const bgClasses = {
    emerald: 'bg-emerald-100',
    blue: 'bg-blue-100',
    amber: 'bg-amber-100',
    rose: 'bg-rose-100',
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end text-sm gap-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 whitespace-nowrap">
          <span className="text-gray-900 font-medium">{Math.round(consumed)}</span> / {target}{unit}
        </span>
      </div>
      <div className={cn("h-2.5 w-full rounded-full overflow-hidden", bgClasses[color])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClasses[color])}
        />
      </div>
    </div>
  );
};
