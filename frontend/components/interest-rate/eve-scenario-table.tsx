import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { EveAnalysisResponse } from '@/lib/definitions';
import { formatRon } from '@/lib/utils';
import { EVE_SCENARIO_LABELS, EVE_SCENARIO_ORDER } from './eve-scenarios';

export interface EveScenarioTableProps {
  data: EveAnalysisResponse;
}

export function EveScenarioTable({ data }: EveScenarioTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Scenariu</TableHead>
          <TableHead className='text-right'>VP Active</TableHead>
          <TableHead className='text-right'>VP Pasive</TableHead>
          <TableHead className='text-right'>EVE</TableHead>
          <TableHead className='text-right'>ΔEVE</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {EVE_SCENARIO_ORDER.map((scenario) => {
          const result = data.scenarios[scenario];
          return (
            <TableRow key={scenario}>
              <TableCell className='font-medium'>
                {EVE_SCENARIO_LABELS[scenario]}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {formatRon(result.pv_assets)}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {formatRon(result.pv_liabilities)}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {formatRon(result.eve_value)}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {scenario === 'base'
                  ? '—'
                  : `${result.delta_eve >= 0 ? '+' : ''}${formatRon(result.delta_eve)}`}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
