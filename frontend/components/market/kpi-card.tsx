import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TrafficLight } from '@/lib/definitions';
import InfoDrawer from '@/components/custom/info-drawer';
import KpiChart from './kpi-chart';
import { TrafficLightBadge } from './traffic-light-badge';

export interface KpiCardInfo {
  title: string;
  definition?: string;
  equation?: string;
  implementation?: string[];
}

export interface KpiCardChart {
  title: string;
  description?: string;
  content: React.ReactNode;
}

export interface KpiCardProps {
  label: string;
  value: string;
  subValue?: string;
  status?: TrafficLight;
  info?: KpiCardInfo;
  chart?: KpiCardChart;
  className?: string;
}

export function KpiCard({
  label,
  value,
  subValue,
  status,
  info,
  chart,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn('gap-2 py-4', className)}>
      <CardHeader className='flex flex-row items-start justify-between gap-2 px-4 pb-0'>
        <CardTitle className='flex items-start gap-1 text-muted-foreground text-sm font-medium'>
          {label}
          {info && (
            <InfoDrawer
              title={info.title}
              definition={info.definition}
              equation={info.equation}
              implementation={info.implementation}
            />
          )}
          {chart && (
            <KpiChart title={chart.title} description={chart.description}>
              {chart.content}
            </KpiChart>
          )}
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
