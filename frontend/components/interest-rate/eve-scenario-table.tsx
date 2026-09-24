import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { EveAnalysisResponse } from '@/lib/definitions';
import { EVE_SCENARIO_ORDER } from './eve-scenarios';
import { useDictionary, useFormatRon } from '@/providers/i18n-provider';

export interface EveScenarioTableProps {
  data: EveAnalysisResponse;
}

export function EveScenarioTable({ data }: EveScenarioTableProps) {
  const { table, scenarios } = useDictionary().interestRate;
  const ron = useFormatRon();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{table.scenario}</TableHead>
          <TableHead className='text-right'>{table.pvAssets}</TableHead>
          <TableHead className='text-right'>{table.pvLiabilities}</TableHead>
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
                {scenarios[scenario]}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {ron(result.pv_assets)}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {ron(result.pv_liabilities)}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {ron(result.eve_value)}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {scenario === 'base'
                  ? '—'
                  : `${result.delta_eve >= 0 ? '+' : ''}${ron(result.delta_eve)}`}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
