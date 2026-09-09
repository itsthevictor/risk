'use client';

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatPercent, formatUsd } from '@/lib/utils';
import type { TrafficLight } from '@/lib/definitions';

interface GradeRow {
  grade: string;
  n_credite: number;
  PD_mediu: number;
  LGD_grade: number;
  EAD_total: number;
  RWA_total: number;
  densitate_capital: number;
}

const TRAFFIC_LIGHT_COLORS: Record<TrafficLight, string> = {
  green: 'var(--color-chart-2)',
  yellow: 'oklch(0.77 0.16 70)',
  red: '#A6402F',
};

const chartConfig: ChartConfig = {
  densitate_capital: { label: 'Densitate capital' },
};

export function densityStatus(densitateCapital: number): TrafficLight {
  if (densitateCapital < 0.6) return 'green';
  if (densitateCapital < 1.0) return 'yellow';
  return 'red';
}

export interface GradeChartProps {
  data: GradeRow[];
}

export function GradeChart({ data }: GradeChartProps) {
  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-64 w-full'>
      <BarChart data={data} margin={{ top: 12, right: 12, left: 12, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis dataKey='grade' tick={{ fontSize: 10 }} />
        <YAxis
          tickFormatter={(v) => formatPercent(v, 0)}
          tick={{ fontSize: 10 }}
          width={40}
        />
        <ReferenceLine y={1.0} stroke='var(--border)' strokeDasharray='3 3' />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => `Grad ${payload[0]?.payload.grade}`}
              formatter={(value, name, item) => {
                if (name !== 'densitate_capital') return [value, name];
                const row = item.payload as GradeRow;
                return [
                  <div key='details' className='flex flex-col gap-0.5'>
                    <span>Densitate: {formatPercent(row.densitate_capital, 1)}</span>
                    <span>PD mediu: {formatPercent(row.PD_mediu, 2)}</span>
                    <span>LGD: {formatPercent(row.LGD_grade, 1)}</span>
                    <span>
                      {row.n_credite.toLocaleString('ro-RO')} credite · EAD{' '}
                      {formatUsd(row.EAD_total)}
                    </span>
                  </div>,
                  '',
                ];
              }}
            />
          }
        />
        <Bar dataKey='densitate_capital' radius={2}>
          {data.map((row) => (
            <Cell
              key={row.grade}
              fill={TRAFFIC_LIGHT_COLORS[densityStatus(row.densitate_capital)]}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
