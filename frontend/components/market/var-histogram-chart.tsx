'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { buildHistogram, formatUsd, nearestBinMid } from '@/lib/utils';
import type { TimeSeries } from '@/lib/definitions';
import { useDictionary } from '@/providers/i18n-provider';

export interface VarHistogramChartProps {
  pnl: TimeSeries;
  varLevel: number;
  esLevel: number;
}

export function VarHistogramChart({
  pnl,
  varLevel,
  esLevel,
}: VarHistogramChartProps) {
  const { varTable } = useDictionary().market;
  const chartConfig: ChartConfig = {
    count: { label: varTable.days, color: 'var(--color-chart-2)' },
  };
  const bins = buildHistogram(pnl.values, 24);
  const varMid = nearestBinMid(bins, -varLevel);
  const esMid = nearestBinMid(bins, -esLevel);

  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-128 w-full'>
      <BarChart
        data={bins}
        margin={{ top: 34, right: 12, left: 12, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis
          dataKey='mid'
          tickFormatter={(v) => formatUsd(v, 0)}
          tick={{ fontSize: 10 }}
          interval={Math.max(0, Math.ceil(bins.length / 6) - 1)}
        />
        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={28} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const bin = payload?.[0]?.payload as
                  { start: number; end: number } | undefined;
                return bin
                  ? `${formatUsd(bin.start, 0)} – ${formatUsd(bin.end, 0)}`
                  : null;
              }}
            />
          }
        />
        <Bar dataKey='count' fill='var(--color-count)' radius={2} />
        <ReferenceLine
          x={esMid}
          stroke='var(--destructive)'
          strokeDasharray='4 4'
          label={{
            value: `ES ${formatUsd(esLevel)}`,
            position: 'top',
            offset: 22,
            fontSize: 10,
          }}
        />
        <ReferenceLine
          x={varMid}
          stroke='var(--color-chart-4)'
          strokeDasharray='4 4'
          label={{
            value: `VaR ${formatUsd(varLevel)}`,
            position: 'top',
            offset: 6,
            fontSize: 10,
          }}
        />
      </BarChart>
    </ChartContainer>
  );
}
