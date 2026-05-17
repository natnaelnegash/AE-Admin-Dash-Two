// Centralized status badge. Maps every possible status string to the
// correct color variant. Add new statuses here, not inline in page components.

const COLOR_MAP: Record<string, string> = {
  // Order statuses
  COMPLETED:              'bg-green-500/20 text-green-400 border-green-500/30',
  DELIVERED:              'bg-green-500/20 text-green-400 border-green-500/30',
  RECEIVED:               'bg-green-500/20 text-green-400 border-green-500/30',
  EN_ROUTE:               'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PICKED_UP:              'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ASSIGNED:               'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DISPATCHED:             'bg-blue-500/20 text-blue-400 border-blue-500/30',
  AWAITING_ACCEPT:        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  AWAITING_PAYMENT:       'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAYMENT_RECEIVED:       'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  VENDOR_BEING_PREPARED:  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  VENDOR_FINISHED:        'bg-orange-500/20 text-orange-400 border-orange-500/30',
  VENDOR_READY_FOR_PICKUP:'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CANCELLED:              'bg-red-500/20 text-red-400 border-red-500/30',
  DISPUTED:               'bg-red-500/20 text-red-400 border-red-500/30',
  NO_DELIVERER_FOUND:     'bg-red-500/20 text-red-400 border-red-500/30',
  CREATED:                'bg-gray-500/20 text-gray-400 border-gray-500/30',
  ARRIVED:                'bg-purple-500/20 text-purple-400 border-purple-500/30',

  // Verification / user statuses
  PENDING:                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  APPROVED:               'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED:               'bg-red-500/20 text-red-400 border-red-500/30',
  ACTIVE:                 'bg-green-500/20 text-green-400 border-green-500/30',
  BANNED:                 'bg-red-500/20 text-red-400 border-red-500/30',

  // Dispute statuses
  OPEN:                   'bg-red-500/20 text-red-400 border-red-500/30',
  UNDER_REVIEW:           'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  RESOLVED:               'bg-green-500/20 text-green-400 border-green-500/30',
  DISMISSED:              'bg-gray-500/20 text-gray-400 border-gray-500/30',

  // Ledger statuses
  FAILED:                 'bg-red-500/20 text-red-400 border-red-500/30',

  // Payment statuses
  CAPTURED:               'bg-green-500/20 text-green-400 border-green-500/30',
  AUTHORIZED:             'bg-blue-500/20 text-blue-400 border-blue-500/30',
  REFUNDED:               'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

interface StatusBadgeProps {
  status: string;
  size?: 'xs' | 'sm';
  className?: string;
}

export function StatusBadge({ status, size = 'xs', className = '' }: StatusBadgeProps) {
  const color = COLOR_MAP[status] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  const textSize = size === 'sm' ? 'text-xs' : 'text-[10px]';

  // Pretty-print: replace underscores, capitalize each word
  const label = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border font-black uppercase tracking-widest ${textSize} ${color} ${className}`}
    >
      {label}
    </span>
  );
}
