import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ConfidenceLevelResult, MethodResults } from '@/lib/definitions';
import { formatPercent, formatUsd } from '@/lib/utils';

const METHOD_LABELS: Record<keyof MethodResults, string> = {
  historical: 'Historical Simulation',
  parametric: 'Parametric (sample std)',
  ewma: 'Parametric (EWMA)',
  garch: 'Parametric (GARCH)',
  monte_carlo: 'Monte Carlo',
};

const METHOD_ORDER = Object.keys(METHOD_LABELS) as (keyof MethodResults)[];

export interface VarComparisonTableProps {
  varComparison: ConfidenceLevelResult[];
  confidenceLevel: number;
}

export function VarComparisonTable({
  varComparison,
  confidenceLevel,
}: VarComparisonTableProps) {
  const result = varComparison.find(
    (c) => c.confidence_level === confidenceLevel,
  );

  if (!result) {
    return (
      <p className='text-muted-foreground text-sm'>
        No data for confidence level {formatPercent(confidenceLevel, 0)}.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Method</TableHead>
          <TableHead className='text-right'>VaR</TableHead>
          <TableHead className='text-right'>ES</TableHead>
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
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
