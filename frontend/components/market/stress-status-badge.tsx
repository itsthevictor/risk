import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StressStatus } from '@/lib/definitions';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { useDictionary } from '@/providers/i18n-provider';

const STRESS_STATUS_STYLES: Record<StressStatus, string> = {
  ok: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  critical: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

const STRESS_STATUS_LABELS: Record<StressStatus, keyof Dictionary['status']> = {
  ok: 'ok',
  warning: 'warning',
  critical: 'critical',
};

export function StressStatusBadge({
  status,
  className,
}: {
  status: StressStatus;
  className?: string;
}) {
  const dict = useDictionary();

  return (
    <Badge
      variant='outline'
      className={cn(
        'border-transparent font-medium',
        STRESS_STATUS_STYLES[status],
        className,
      )}
    >
      {dict.status[STRESS_STATUS_LABELS[status]]}
    </Badge>
  );
}
