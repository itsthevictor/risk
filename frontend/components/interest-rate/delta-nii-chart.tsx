'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { NIIAnalysisResponse } from '@/lib/definitions';
import { useFormatRon } from '@/providers/i18n-provider';

const chartConfig: ChartConfig = {
  delta_nii: { label: 'Delta NII', color: 'var(--color-chart-2)' },
};

export interface DeltaNiiChartProps {
  data: NIIAnalysisResponse;
}

export function DeltaNiiChart({ data }: DeltaNiiChartProps) {
  const ron = useFormatRon();
  const rows = [
    { name: `+${data.shock_bp} bps`, delta_nii: data.shock_up.delta_nii },
    { name: `-${data.shock_bp} bps`, delta_nii: data.shock_down.delta_nii },
  ];

  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-80 w-full'>
      <BarChart
        data={rows}
        margin={{ top: 12, right: 12, left: 12, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis dataKey='name' tick={{ fontSize: 10 }} />
        <YAxis
          tickFormatter={(v) => ron(v, 0)}
          tick={{ fontSize: 10 }}
          width={64}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [ron(Number(value)), 'Delta NII']}
            />
          }
        />
        <Bar dataKey='delta_nii' radius={2}>
          {rows.map((row) => (
            <Cell
              key={row.name}
              fill={
                row.delta_nii >= 0
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
