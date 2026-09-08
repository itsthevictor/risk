import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  ConfidenceLevelResult,
  MethodResults,
  TimeSeries,
} from '@/lib/definitions';
import { formatPercent, formatUsd } from '@/lib/utils';
import KpiChart from './kpi-chart';
import { VarHistogramChart } from './var-histogram-chart';

const METHOD_LABELS: Record<keyof MethodResults, string> = {
  historical: 'Simulare Istorică',
  parametric: 'Parametric (deviație standard eșantion)',
  ewma: 'Parametric (EWMA)',
  garch: 'Parametric (GARCH)',
  monte_carlo: 'Monte Carlo',
};

const METHOD_ORDER = Object.keys(METHOD_LABELS) as (keyof MethodResults)[];

export interface VarComparisonTableProps {
  varComparison: ConfidenceLevelResult[];
  confidenceLevel: number;
  actualPnl: TimeSeries;
}

export function VarComparisonTable({
  varComparison,
  confidenceLevel,
  actualPnl,
}: VarComparisonTableProps) {
  const result = varComparison.find(
    (c) => c.confidence_level === confidenceLevel,
  );

  if (!result) {
    return (
      <p className='text-muted-foreground text-sm'>
        Nu există date pentru nivelul de încredere{' '}
        {formatPercent(confidenceLevel, 0)}.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Metodă</TableHead>
          <TableHead className='text-right'>VaR</TableHead>
          <TableHead className='text-right'>ES</TableHead>
          <TableHead className='w-8' />
        </TableRow>
      </TableHeader>
      <TableBody>
        {METHOD_ORDER.map((method) => {
          const pair = result.methods[method];
          return (
            <TableRow key={method}>
              <TableCell className='font-medium'>
                {METHOD_LABELS[method]}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {formatUsd(pair.var)}
                <span className='text-muted-foreground ml-1.5 text-xs'>
                  ({formatPercent(pair.var_pct)})
                </span>
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {formatUsd(pair.es)}
                <span className='text-muted-foreground ml-1.5 text-xs'>
                  ({formatPercent(pair.es_pct)})
                </span>
              </TableCell>
              <TableCell>
                <KpiChart
                  title={`Distribuția P&L — ${METHOD_LABELS[method]}`}
                  description='Histograma P&L-ului zilnic realizat, cu pragurile de pierdere VaR și ES marcate.'
                >
                  <VarHistogramChart
                    pnl={actualPnl}
                    varLevel={pair.var}
                    esLevel={pair.es}
                  />
                </KpiChart>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
