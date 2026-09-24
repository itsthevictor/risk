'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { EveAnalysisResponse } from '@/lib/definitions';
import { EVE_SCENARIO_ORDER } from './eve-scenarios';
import { useDictionary, useFormatRon } from '@/providers/i18n-provider';

const chartConfig: ChartConfig = {
  delta_eve: { label: 'Delta EVE', color: 'var(--color-chart-2)' },
};

export interface DeltaEveChartProps {
  data: EveAnalysisResponse;
}

export function DeltaEveChart({ data }: DeltaEveChartProps) {
  const { scenarios } = useDictionary().interestRate;
  const ron = useFormatRon();
  const rows = EVE_SCENARIO_ORDER.filter((scenario) => scenario !== 'base').map(
    (scenario) => ({
      name: scenarios[scenario],
      delta_eve: data.scenarios[scenario].delta_eve,
    }),
  );

  return (
    <ChartContainer
      config={chartConfig}
      className='aspect-auto h-[22.5rem] w-full'
    >
      <BarChart
        data={rows}
        margin={{ top: 12, right: 12, left: 12, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis
          dataKey='name'
          tick={{ fontSize: 10 }}
          angle={-30}
          textAnchor='end'
          height={60}
        />
        <YAxis
          tickFormatter={(v) => ron(v, 0)}
          tick={{ fontSize: 10 }}
          width={64}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [ron(Number(value)), 'ΔEVE']}
            />
          }
        />
        <Bar dataKey='delta_eve' radius={2}>
          {rows.map((row) => (
            <Cell
              key={row.name}
              fill={
                row.delta_eve >= 0
                  ? 'var(--color-chart-4)'
                  : 'var(--color-destructive)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
