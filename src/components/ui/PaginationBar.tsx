import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationBarProps) {
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex items-center justify-between px-2">
      <p className="text-xs text-muted-foreground font-medium">
        Showing{' '}
        <span className="text-foreground font-bold">{from}–{to}</span>
        {' '}of{' '}
        <span className="text-foreground font-bold">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest px-3">
          {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
