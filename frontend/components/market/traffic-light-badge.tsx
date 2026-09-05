import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TrafficLight } from '@/lib/definitions';

const TRAFFIC_LIGHT_STYLES: Record<TrafficLight, string> = {
  green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  yellow: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  red: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

const TRAFFIC_LIGHT_LABELS: Record<TrafficLight, string> = {
  green: 'OK',
  yellow: 'Warning',
  red: 'Breach',
};

const SEVERITY: Record<TrafficLight, number> = { green: 0, yellow: 1, red: 2 };

export function worstTrafficLight(lights: TrafficLight[]): TrafficLight {
  return lights.reduce<TrafficLight>(
    (worst, light) => (SEVERITY[light] > SEVERITY[worst] ? light : worst),
    'green',
  );
}

export function TrafficLightBadge({
  status,
  className,
}: {
  status: TrafficLight;
  className?: string;
}) {
  return (
    <Badge
      variant='outline'
      className={cn(
        'border-transparent font-medium',
        TRAFFIC_LIGHT_STYLES[status],
        className,
      )}
    >
      {TRAFFIC_LIGHT_LABELS[status]}
    </Badge>
  );
}
