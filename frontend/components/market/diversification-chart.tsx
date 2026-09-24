'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatUsd } from '@/lib/utils';
import type { DiversificationResult } from '@/lib/definitions';
import { useDictionary } from '@/providers/i18n-provider';

const chartConfig: ChartConfig = {
  var: { label: 'VaR', color: 'var(--color-chart-2)' },
};

export interface DiversificationChartProps {
  data: DiversificationResult;
}

export function DiversificationChart({ data }: DiversificationChartProps) {
  const { charts } = useDictionary().market;
  const rows = [
    ...Object.entries(data.standalone_vars).map(([ticker, value]) => ({
      name: ticker,
      var: value,
      diversified: false,
    })),
    { name: charts.portfolio, var: data.portfolio_var, diversified: true },
  ];

  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-128 w-full'>
      <BarChart
        data={rows}
        margin={{ top: 12, right: 12, left: 12, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis dataKey='name' tick={{ fontSize: 10 }} />
        <YAxis
          tickFormatter={(v) => formatUsd(v, 0)}
          tick={{ fontSize: 10 }}
          width={56}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [formatUsd(Number(value)), 'VaR']}
            />
          }
        />
        <Bar dataKey='var' radius={2}>
          {rows.map((row) => (
            <Cell
              key={row.name}
              fill={
                row.diversified ? 'var(--color-chart-4)' : 'var(--color-var)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
