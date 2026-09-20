'use client';

import { ChartBarIcon } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface KpiChartProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  triggerClassName?: string;
}

function KpiChart({
  title,
  description,
  children,
  triggerClassName,
}: KpiChartProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant='ghost'
            size='icon-xs'
            className={cn(
              'rounded-full text-muted-foreground',
              triggerClassName,
            )}
            data-umami-event={`kpi-chart-${title}`}
          />
        }
      >
        <ChartBarIcon />
        <span className='sr-only'>Vezi grafic</span>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[70rem]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default KpiChart;
