import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TrafficLight } from '@/lib/definitions';
import { TrafficLightBadge } from './traffic-light-badge';

export interface KpiCardProps {
  label: string;
  value: string;
  subValue?: string;
  status?: TrafficLight;
  className?: string;
}

export function KpiCard({
  label,
  value,
  subValue,
  status,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn('gap-2 py-4', className)}>
      <CardHeader className='flex flex-row items-center justify-between gap-2 px-4 pb-0'>
        <CardTitle className='text-muted-foreground text-sm font-medium'>
          {label}
        </CardTitle>
        {status && <TrafficLightBadge status={status} />}
      </CardHeader>
      <CardContent className='px-4'>
        <div className='text-2xl font-semibold tabular-nums'>{value}</div>
        {subValue && (
          <div className='text-muted-foreground mt-1 text-xs'>{subValue}</div>
        )}
      </CardContent>
    </Card>
  );
}
