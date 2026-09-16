'use client';

import {
  CartesianGrid,
  ReferenceLine,
  Scatter,
  ScatterChart,
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

interface CalibrationPoint {
  decile: number;
  pd_predicted: number;
  default_actual: number;
}

const chartConfig: ChartConfig = {
  default_actual: { label: 'Rată reală', color: 'var(--color-chart-2)' },
};

export interface CalibrationChartProps {
  data: CalibrationPoint[];
}

export function CalibrationChart({ data }: CalibrationChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.pd_predicted, d.default_actual)),
  );
  const axisMax = maxValue * 1.1;

  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-72 w-full'>
      <ScatterChart margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis
          type='number'
          dataKey='pd_predicted'
          name='PD calibrat'
          domain={[0, axisMax]}
          tickFormatter={(v) => formatPercent(v, 0)}
          tick={{ fontSize: 10 }}
          label={{
            value: 'PD calibrat',
            position: 'insideBottom',
            offset: -6,
            fontSize: 11,
          }}
        />
        <YAxis
          type='number'
          dataKey='default_actual'
          name='rată reală'
          domain={[0, axisMax]}
          tickFormatter={(v) => formatPercent(v, 0)}
          tick={{ fontSize: 10 }}
          width={40}
        />
        <ReferenceLine
          segment={[
            { x: 0, y: 0 },
            { x: axisMax, y: axisMax },
          ]}
          stroke='var(--border)'
          strokeDasharray='4 3'
        />
        <ChartTooltip
          cursor={{ strokeDasharray: '3 3' }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                `Decila ${payload[0]?.payload.decile}`
              }
              formatter={(value, name) => [
                formatPercent(Number(value), 2),
                name === 'pd_predicted' ? 'PD calibrat' : 'Rată reală',
              ]}
            />
          }
        />
        <Scatter
          data={data}
          dataKey='default_actual'
          fill='var(--color-default_actual)'
        />
      </ScatterChart>
    </ChartContainer>
  );
}
