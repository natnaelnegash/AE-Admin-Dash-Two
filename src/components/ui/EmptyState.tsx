import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-secondary/60 border border-border/50 flex items-center justify-center mb-2">
        <Icon size={36} className="text-muted-foreground" />
      </div>
      <h3 className="text-foreground text-lg font-black">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-sm font-medium">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
