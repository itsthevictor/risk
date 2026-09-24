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
import { useDictionary } from '@/providers/i18n-provider';
import { fmt } from '@/lib/i18n/config';

const METHOD_ORDER: (keyof MethodResults)[] = [
  'historical',
  'parametric',
  'ewma',
  'garch',
  'monte_carlo',
];

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
  const { market } = useDictionary();
  const methodLabel = (method: keyof MethodResults) =>
    method === 'parametric'
      ? market.methods.parametricSampleStd
      : market.methods[method];
  const result = varComparison.find(
    (c) => c.confidence_level === confidenceLevel,
  );

  if (!result) {
    return (
      <p className='text-muted-foreground text-sm'>
        {fmt(market.varTable.noData, {
          level: formatPercent(confidenceLevel, 0),
        })}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{market.varTable.method}</TableHead>
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
                {methodLabel(method)}
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
                  title={fmt(market.varTable.distributionTitle, {
                    method: methodLabel(method),
                  })}
                  description={market.varTable.distributionDescription}
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
