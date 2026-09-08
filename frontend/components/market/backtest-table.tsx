import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { MethodBacktest } from '@/lib/definitions';
import { TrafficLightBadge } from './traffic-light-badge';

const METHOD_LABELS: Record<keyof MethodBacktest, string> = {
  historical: 'Simulare Istorică',
  parametric: 'Parametric',
  ewma: 'Parametric (EWMA)',
  garch: 'Parametric (GARCH)',
  monte_carlo: 'Monte Carlo',
};

const METHOD_ORDER = Object.keys(METHOD_LABELS) as (keyof MethodBacktest)[];

function formatLr(value: number): string {
  return value.toFixed(2);
}

function formatPValue(value: number): string {
  return value < 0.0001 ? '<0.0001' : value.toFixed(4);
}

export interface BacktestScorecardTableProps {
  data: MethodBacktest;
}

export function BacktestScorecardTable({ data }: BacktestScorecardTableProps) {
  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metodă</TableHead>
            <TableHead className='text-right'>Depășiri</TableHead>
            <TableHead className='text-right'>Observații</TableHead>
            <TableHead className='text-right'>Kupiec LR</TableHead>
            <TableHead className='text-right'>Kupiec p</TableHead>
            <TableHead className='text-right'>Christoffersen LR</TableHead>
            <TableHead className='text-right'>Christoffersen p</TableHead>
            <TableHead className='text-right'>CC LR</TableHead>
            <TableHead className='text-right'>CC p</TableHead>
            <TableHead>Semafor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {METHOD_ORDER.map((method) => {
            const stats = data[method];
            return (
              <TableRow key={method}>
                <TableCell className='font-medium'>
                  {METHOD_LABELS[method]}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {stats.hits}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {stats.total_observations}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatLr(stats.kupiec_lr)}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatPValue(stats.kupiec_p_value)}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatLr(stats.christoffersen_lr)}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatPValue(stats.christoffersen_p_value)}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatLr(stats.conditional_coverage_lr)}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatPValue(stats.conditional_coverage_p_value)}
                </TableCell>
                <TableCell>
                  <TrafficLightBadge status={stats.traffic_light} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
