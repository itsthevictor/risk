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
import { useDictionary } from '@/providers/i18n-provider';

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
  const dict = useDictionary();

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
        <span className='sr-only'>{dict.common.viewChart}</span>
      </DialogTrigger>
      <DialogContent className='sm:max-w-280'>
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
