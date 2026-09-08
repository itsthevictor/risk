'use client';

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  Scatter,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatUsd } from '@/lib/utils';
import type { TimeSeries } from '@/lib/definitions';

const chartConfig: ChartConfig = {
  pnl: { label: 'P&L realizat', color: 'var(--color-chart-2)' },
};

export interface PnlExceptionsChartProps {
  pnl: TimeSeries;
  breachDates?: string[];
  varLevel?: number;
}

export function PnlExceptionsChart({
  pnl,
  breachDates,
  varLevel,
}: PnlExceptionsChartProps) {
  const breachSet = new Set(breachDates ?? []);
  const rows = pnl.dates.map((date, i) => ({
    date,
    pnl: pnl.values[i],
    isBreach: breachSet.has(date),
  }));
  const breachRows = rows.filter((row) => row.isBreach);

  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-128 w-full'>
      <ComposedChart
        data={rows}
        margin={{ top: 12, right: 12, left: 12, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis dataKey='date' tick={{ fontSize: 10 }} minTickGap={32} />
        <YAxis
          tickFormatter={(v) => formatUsd(v, 0)}
          tick={{ fontSize: 10 }}
          width={56}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => [
                formatUsd(Number(value)),
                item.payload.isBreach ? 'P&L (depășire VaR)' : 'P&L',
              ]}
            />
          }
        />
        <ReferenceLine y={0} stroke='var(--border)' />
        {varLevel !== undefined && (
          <ReferenceLine
            y={-varLevel}
            stroke='var(--destructive)'
            strokeDasharray='4 4'
            label={{
              value: `-VaR curent ${formatUsd(varLevel)}`,
              position: 'insideBottomLeft',
              fontSize: 10,
            }}
          />
        )}
        <Line
          type='monotone'
          dataKey='pnl'
          stroke='var(--color-pnl)'
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
        />
        <Scatter
          data={breachRows}
          dataKey='pnl'
          fill='var(--destructive)'
          isAnimationActive={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
