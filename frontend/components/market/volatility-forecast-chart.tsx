'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatPercent } from '@/lib/utils';
import type { VolatilityForecast } from '@/lib/definitions';

const chartConfig: ChartConfig = {
  ewma: { label: 'EWMA', color: 'var(--color-chart-2)' },
  garch: { label: 'GARCH', color: 'var(--color-chart-4)' },
};

export interface VolatilityForecastChartProps {
  data: VolatilityForecast;
}

export function VolatilityForecastChart({
  data,
}: VolatilityForecastChartProps) {
  const rows = data.dates.map((date, i) => ({
    date,
    ewma: data.ewma[i],
    garch: data.garch[i],
  }));

  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-[32rem] w-full'>
      <LineChart data={rows} margin={{ top: 12, right: 12, left: 12, bottom: 0 }}>
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
              formatter={(value, name) => [
                formatPercent(Number(value)),
                chartConfig[name as keyof typeof chartConfig]?.label ?? name,
              ]}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type='monotone'
          dataKey='ewma'
          stroke='var(--color-ewma)'
          dot={false}
          strokeWidth={1.5}
        />
        <Line
          type='monotone'
          dataKey='garch'
          stroke='var(--color-garch)'
          dot={false}
          strokeWidth={1.5}
        />
      </LineChart>
    </ChartContainer>
  );
}
