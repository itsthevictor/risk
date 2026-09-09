import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { NIIAnalysisResponse } from '@/lib/definitions';
import { formatRon } from '@/lib/utils';

export interface NiiScenarioTableProps {
  data: NIIAnalysisResponse;
}

export function NiiScenarioTable({ data }: NiiScenarioTableProps) {
  const rows = [
    { label: 'Bază (fără șoc)', ...data.base, delta_nii: 0 },
    { label: `Șoc +${data.shock_bp} bps`, ...data.shock_up },
    { label: `Șoc -${data.shock_bp} bps`, ...data.shock_down },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Scenariu</TableHead>
          <TableHead className='text-right'>Venit din dobânzi</TableHead>
          <TableHead className='text-right'>Cheltuială cu dobânzi</TableHead>
          <TableHead className='text-right'>NII</TableHead>
          <TableHead className='text-right'>ΔNII</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell className='font-medium'>{row.label}</TableCell>
            <TableCell className='text-right tabular-nums'>
              {formatRon(row.total_income)}
            </TableCell>
            <TableCell className='text-right tabular-nums'>
              {formatRon(row.total_expense)}
            </TableCell>
            <TableCell className='text-right tabular-nums'>
              {formatRon(row.nii_value)}
            </TableCell>
            <TableCell className='text-right tabular-nums'>
              {row.label === 'Bază (fără șoc)'
                ? '—'
                : `${row.delta_nii >= 0 ? '+' : ''}${formatRon(row.delta_nii)}`}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
