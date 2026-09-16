import { cn, formatPercent, formatUsd } from '@/lib/utils';
import type { StressTestResult } from '@/lib/definitions';
import { StressStatusBadge } from './stress-status-badge';
import { ASSET_CLASS_LABELS } from './shock-inputs';

export interface StressResultCardProps {
  title: string;
  description?: string;
  result: StressTestResult;
}

export function StressResultCard({
  title,
  description,
  result,
}: StressResultCardProps) {
  return (
    <div className='space-y-2 rounded-lg border p-4'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <h3 className='text-muted-foreground text-sm font-medium'>
            {title}
          </h3>
          {description && (
            <p className='text-muted-foreground text-xs'>{description}</p>
          )}
        </div>
        <StressStatusBadge status={result.status} />
      </div>
      <div
        className={cn(
          'text-2xl font-semibold tabular-nums',
          result.pnl < 0 && 'text-destructive',
        )}
      >
        {formatUsd(result.pnl)} ({formatPercent(result.pnl_pct)})
      </div>
      <div className='text-muted-foreground text-sm tabular-nums'>
        Valoare finală {formatUsd(result.ending_value)}
      </div>
      {result.annualized_volatility != null && (
        <div className='text-muted-foreground text-sm tabular-nums'>
          Volatilitate (anualizată) în fereastră{' '}
          {formatPercent(result.annualized_volatility)}
        </div>
      )}
      {result.shocks_applied && (
        <div className='text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs'>
          {Object.entries(result.shocks_applied).map(([cls, shock]) => (
            <span key={cls} className='tabular-nums'>
              {ASSET_CLASS_LABELS[cls] ?? cls}: {formatPercent(shock)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
