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

// chart-2/chart-4 sunt aproape identice (aceeași nuanță gri-albastru, doar
// luminozitate diferită) — aici avem nevoie de contrast mare între cele două
// linii, așa că folosim direct un portocaliu vs. un gri închis.
const chartConfig: ChartConfig = {
  ewma: { label: 'EWMA', color: 'oklch(0.705 0.191 46.5)' },
  garch: { label: 'GARCH', color: 'oklch(0.275 0.011 216.9)' },
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
    <ChartContainer config={chartConfig} className='aspect-auto h-128 w-full'>
      <LineChart
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
