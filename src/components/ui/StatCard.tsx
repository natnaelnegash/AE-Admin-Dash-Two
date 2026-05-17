import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-orange-400',
  iconBg = 'bg-orange-500/10',
  trend,
  className = '',
}: StatCardProps) {
  return (
    <div className={`admin-card p-6 shadow-xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      <p className="text-foreground text-3xl font-black tracking-tight">{value}</p>
      {trend && (
        <p className={`text-xs mt-2 font-bold ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  );
}
