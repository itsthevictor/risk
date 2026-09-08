'use client';

import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts';
import type { DotItemDotProps } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatUsd } from '@/lib/utils';
import type { TimeSeries } from '@/lib/definitions';

const chartConfig: ChartConfig = {
  pnl: { label: 'P&L realizat', color: 'var(--color-chart-2)' },
  // Deliberately not --destructive: that's the breach-dot color, and a line the same
  // shade of red would visually vanish under a cluster of dots right where it matters.
  varThreshold: { label: 'Prag VaR (zilnic)', color: 'oklch(0.77 0.16 70)' },
};

interface PnlRow {
  date: string;
  pnl: number;
  isBreach: boolean;
  varThreshold?: number;
}

function BreachDot(props: DotItemDotProps) {
  const { cx, cy, payload, index } = props;
  const row = payload as PnlRow;
  if (!row?.isBreach || cx === undefined || cy === undefined) {
    // recharts always calls `dot` once per point — an empty group keeps
    // non-breach days silent instead of drawing a dot for every day.
    return <g key={`dot-${index}`} />;
  }
  return (
    <circle
      key={`dot-${index}`}
      cx={cx}
      cy={cy}
      r={3}
      fill='var(--destructive)'
      stroke='none'
    />
  );
}

export interface PnlExceptionsChartProps {
  pnl: TimeSeries;
  breachDates?: string[];
  /**
   * That method's rolling VaR for every day (dollar terms, positive = loss) — the
   * actual time-varying threshold breachDates was computed against. A single constant
   * "today" VaR would make old breaches look like they sit above the line, since VaR
   * itself moves over time; plotting the real per-day threshold keeps every red dot
   * visibly below it.
   */
  varSeries?: TimeSeries;
  /** e.g. "Simulare Istorică" — which method the VaR line and breach dots belong to */
  methodLabel?: string;
}

export function PnlExceptionsChart({
  pnl,
  breachDates,
  varSeries,
  methodLabel,
}: PnlExceptionsChartProps) {
  const breachSet = new Set(breachDates ?? []);
  const varByDate = new Map(
    (varSeries?.dates ?? []).map((date, i) => [date, varSeries!.values[i]]),
  );
  const rows: PnlRow[] = pnl.dates.map((date, i) => {
    const varAtDate = varByDate.get(date);
    return {
      date,
      pnl: pnl.values[i],
      isBreach: breachSet.has(date),
      varThreshold: varAtDate !== undefined ? -varAtDate : undefined,
    };
  });

  return (
    <div className='space-y-1'>
      {methodLabel && (
        <p className='text-muted-foreground text-xs'>
          VaR și depășiri: metoda {methodLabel}
        </p>
      )}
      <ChartContainer config={chartConfig} className='aspect-auto h-128 w-full'>
        <LineChart
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
                  name === 'pnl' && (item.payload as PnlRow).isBreach
                    ? 'P&L (depășire VaR)'
                    : (chartConfig[name as keyof typeof chartConfig]?.label ??
                      name),
                ]}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <ReferenceLine y={0} stroke='var(--border)' />
          <Line
            type='monotone'
            dataKey='varThreshold'
            stroke='var(--color-varThreshold)'
            strokeWidth={1.5}
            strokeDasharray='4 4'
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
          <Line
            type='monotone'
            dataKey='pnl'
            stroke='var(--color-pnl)'
            strokeWidth={1}
            dot={BreachDot}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
