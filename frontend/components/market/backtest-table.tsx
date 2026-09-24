'use client';

import { ChartBarIcon } from '@phosphor-icons/react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { MethodBacktest } from '@/lib/definitions';
import { TrafficLightBadge } from './traffic-light-badge';
import { useDictionary } from '@/providers/i18n-provider';

const METHOD_ORDER: (keyof MethodBacktest)[] = [
  'historical',
  'parametric',
  'ewma',
  'garch',
  'monte_carlo',
];

function formatLr(value: number): string {
  return value.toFixed(2);
}

function formatPValue(value: number): string {
  return value < 0.0001 ? '<0.0001' : value.toFixed(4);
}

export interface BacktestScorecardTableProps {
  data: MethodBacktest;
  activeMethod?: keyof MethodBacktest;
  onSelectMethod?: (method: keyof MethodBacktest) => void;
}

export function BacktestScorecardTable({
  data,
  activeMethod,
  onSelectMethod,
}: BacktestScorecardTableProps) {
  const { market } = useDictionary();
  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{market.backtest.method}</TableHead>
            <TableHead className='text-right'>
              {market.backtest.breaches}
            </TableHead>
            {/* <TableHead className='text-right'>Observații</TableHead> */}
            <TableHead className='text-right'>Kupiec LR</TableHead>
            <TableHead className='text-right'>Kupiec p</TableHead>
            <TableHead className='text-right'>Christoffersen LR</TableHead>
            <TableHead className='text-right'>Christoffersen p</TableHead>
            <TableHead className='text-right'>CC LR</TableHead>
            <TableHead className='text-right'>CC p</TableHead>
            <TableHead>{market.backtest.trafficLight}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {METHOD_ORDER.map((method) => {
            const stats = data[method];
            const isActive = method === activeMethod;
            return (
              <TableRow
                key={method}
                onClick={
                  onSelectMethod ? () => onSelectMethod(method) : undefined
                }
                className={cn(
                  onSelectMethod && 'cursor-pointer',
                  isActive && 'bg-muted/50',
                )}
              >
                <TableCell className='font-medium'>
                  <span className='inline-flex items-center gap-1.5'>
                    {onSelectMethod && (
                      <ChartBarIcon
                        className={cn(
                          'text-muted-foreground',
                          isActive && 'text-foreground',
                        )}
                        weight={isActive ? 'fill' : 'regular'}
                      />
                    )}
                    {market.methods[method]}
                  </span>
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {stats.hits}
                </TableCell>
                {/* <TableCell className='text-right tabular-nums'>
                  {stats.total_observations}
                </TableCell> */}
                <TableCell className='text-right tabular-nums'>
                  {formatLr(stats.kupiec_lr)}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatPValue(stats.kupiec_p_value)}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatLr(stats.christoffersen_lr)}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatPValue(stats.christoffersen_p_value)}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatLr(stats.conditional_coverage_lr)}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatPValue(stats.conditional_coverage_p_value)}
                </TableCell>
                <TableCell>
                  <TrafficLightBadge status={stats.traffic_light} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
