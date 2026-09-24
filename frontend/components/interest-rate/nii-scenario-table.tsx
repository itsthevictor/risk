import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { NIIAnalysisResponse } from '@/lib/definitions';
import { fmt } from '@/lib/i18n/config';
import { useDictionary, useFormatRon } from '@/providers/i18n-provider';

export interface NiiScenarioTableProps {
  data: NIIAnalysisResponse;
}

export function NiiScenarioTable({ data }: NiiScenarioTableProps) {
  const { table } = useDictionary().interestRate;
  const ron = useFormatRon();
  const rows = [
    { label: table.niiBase, isBase: true, ...data.base, delta_nii: 0 },
    {
      label: fmt(table.niiShock, { shock: `+${data.shock_bp}` }),
      isBase: false,
      ...data.shock_up,
    },
    {
      label: fmt(table.niiShock, { shock: `-${data.shock_bp}` }),
      isBase: false,
      ...data.shock_down,
    },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{table.scenario}</TableHead>
          <TableHead className='text-right'>{table.interestIncome}</TableHead>
          <TableHead className='text-right'>{table.interestExpense}</TableHead>
          <TableHead className='text-right'>NII</TableHead>
          <TableHead className='text-right'>ΔNII</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell className='font-medium'>{row.label}</TableCell>
            <TableCell className='text-right tabular-nums'>
              {ron(row.total_income)}
            </TableCell>
            <TableCell className='text-right tabular-nums'>
              {ron(row.total_expense)}
            </TableCell>
            <TableCell className='text-right tabular-nums'>
              {ron(row.nii_value)}
            </TableCell>
            <TableCell className='text-right tabular-nums'>
              {row.isBase
                ? '—'
                : `${row.delta_nii >= 0 ? '+' : ''}${ron(row.delta_nii)}`}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
