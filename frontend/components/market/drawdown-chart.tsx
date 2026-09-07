'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatPercent } from '@/lib/utils';
import type { DrawdownResult } from '@/lib/definitions';

const chartConfig: ChartConfig = {
  drawdown: { label: 'Scădere', color: 'var(--destructive)' },
};

export interface DrawdownChartProps {
  data: DrawdownResult;
}

export function DrawdownChart({ data }: DrawdownChartProps) {
  const rows = data.dates.map((date, i) => ({
    date,
    drawdown: data.values[i],
  }));
  const troughIndex = data.values.indexOf(data.max_drawdown);
  const trough = rows[troughIndex];

  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-128 w-full'>
      <AreaChart
        data={rows}
        margin={{ top: 12, right: 12, left: 12, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis dataKey='date' tick={{ fontSize: 10 }} minTickGap={32} />
        <YAxis
          tickFormatter={(v) => formatPercent(v, 0)}
          tick={{ fontSize: 10 }}
          width={40}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [formatPercent(Number(value)), 'Scădere']}
            />
          }
        />
        <Area
          type='monotone'
          dataKey='drawdown'
          stroke='var(--color-drawdown)'
          fill='var(--color-drawdown)'
          fillOpacity={0.15}
          strokeWidth={1.5}
        />
        {trough && (
          <ReferenceDot
            x={trough.date}
            y={trough.drawdown}
            r={4}
            fill='var(--color-drawdown)'
            stroke='none'
            label={{
              value: `Maxim ${formatPercent(data.max_drawdown)}`,
              position: 'bottom',
              fontSize: 10,
            }}
          />
        )}
      </AreaChart>
    </ChartContainer>
  );
}
