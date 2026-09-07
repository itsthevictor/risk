'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { MethodBacktest, TrafficLight } from '@/lib/definitions';

const METHOD_LABELS: Record<keyof MethodBacktest, string> = {
  historical: 'Istoric',
  parametric: 'Parametric',
  ewma: 'EWMA',
  garch: 'GARCH',
  monte_carlo: 'Monte Carlo',
};

const TRAFFIC_LIGHT_COLORS: Record<TrafficLight, string> = {
  green: 'var(--color-chart-2)',
  yellow: 'oklch(0.77 0.16 70)',
  red: 'var(--destructive)',
};

const chartConfig: ChartConfig = {
  hits: { label: 'Depășiri', color: 'var(--color-chart-2)' },
};

export interface BacktestChartProps {
  data: MethodBacktest;
  confidenceLevel: number;
}

export function BacktestChart({ data, confidenceLevel }: BacktestChartProps) {
  const methods = Object.keys(METHOD_LABELS) as (keyof MethodBacktest)[];
  const rows = methods.map((method) => {
    const stats = data[method];
    return {
      name: METHOD_LABELS[method],
      hits: stats.hits,
      expected: Math.round((1 - confidenceLevel) * stats.total_observations),
      trafficLight: stats.traffic_light,
    };
  });

  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-128 w-full'>
      <BarChart
        data={rows}
        margin={{ top: 12, right: 12, left: 12, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis dataKey='name' tick={{ fontSize: 10 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => [
                name === 'hits'
                  ? `${value} (estimat ~${item.payload.expected})`
                  : value,
                name === 'hits' ? 'Depășiri' : name,
              ]}
            />
          }
        />
        <Bar dataKey='hits' radius={2}>
          {rows.map((row) => (
            <Cell
              key={row.name}
              fill={TRAFFIC_LIGHT_COLORS[row.trafficLight]}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
