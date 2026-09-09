import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPercent, formatUsd } from '@/lib/utils';
import { TrafficLightBadge } from '@/components/market/traffic-light-badge';
import { densityStatus } from './grade-chart';

interface GradeRow {
  grade: string;
  n_credite: number;
  PD_mediu: number;
  LGD_grade: number;
  EAD_total: number;
  RWA_total: number;
  densitate_capital: number;
}

export interface GradeTableProps {
  data: GradeRow[];
}

export function GradeTable({ data }: GradeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Grad</TableHead>
          <TableHead className='text-right'>Credite</TableHead>
          <TableHead className='text-right'>PD mediu</TableHead>
          <TableHead className='text-right'>LGD</TableHead>
          <TableHead className='text-right'>EAD</TableHead>
          <TableHead className='text-right'>RWA</TableHead>
          <TableHead className='text-right'>Densitate</TableHead>
          <TableHead className='w-8' />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.grade}>
            <TableCell className='font-medium'>{row.grade}</TableCell>
            <TableCell className='text-right'>
              {row.n_credite.toLocaleString('ro-RO')}
            </TableCell>
            <TableCell className='text-right'>
              {formatPercent(row.PD_mediu, 2)}
            </TableCell>
            <TableCell className='text-right'>
              {formatPercent(row.LGD_grade, 1)}
            </TableCell>
            <TableCell className='text-right'>{formatUsd(row.EAD_total)}</TableCell>
            <TableCell className='text-right'>{formatUsd(row.RWA_total)}</TableCell>
            <TableCell className='text-right font-medium'>
              {formatPercent(row.densitate_capital, 1)}
            </TableCell>
            <TableCell>
              <TrafficLightBadge status={densityStatus(row.densitate_capital)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
