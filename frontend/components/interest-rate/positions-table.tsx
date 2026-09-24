'use client';

import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Position } from '@/lib/definitions';
import { cn, formatDateRo } from '@/lib/utils';
import { useDictionary, useFormatRon } from '@/providers/i18n-provider';

export interface PositionsTableProps {
  data: Position[];
}

type SortColumn = keyof Pick<
  Position,
  | 'position_id'
  | 'position_type'
  | 'category'
  | 'principal'
  | 'current_rate'
  | 'repricing_date'
  | 'maturity_date'
>;

type SortDirection = 'asc' | 'desc';

// Header labels: dict.interestRate.data.columns
const COLUMNS: { key: SortColumn; align?: 'right' }[] = [
  { key: 'position_id' },
  { key: 'position_type' },
  { key: 'category' },
  { key: 'principal', align: 'right' },
  { key: 'current_rate', align: 'right' },
  { key: 'repricing_date' },
  { key: 'maturity_date' },
];

export function PositionsTable({ data }: PositionsTableProps) {
  const { columns } = useDictionary().interestRate.data;
  const ron = useFormatRon();
  const [sortColumn, setSortColumn] = useState<SortColumn>('position_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue - bValue;
      }
      return String(aValue).localeCompare(String(bValue));
    });
    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [data, sortColumn, sortDirection]);

  function handleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }

  return (
    <div className='max-h-[40rem] overflow-y-auto rounded-md border'>
      <Table>
        <TableHeader className='bg-background sticky top-0 z-10'>
          <TableRow>
            {COLUMNS.map(({ key, align }) => (
              <TableHead
                key={key}
                className={cn(align === 'right' && 'text-right')}
              >
                <button
                  type='button'
                  onClick={() => handleSort(key)}
                  className={cn(
                    'inline-flex items-center gap-1 hover:text-foreground',
                    align === 'right' && 'flex-row-reverse',
                  )}
                >
                  {columns[key]}
                  <span className='text-muted-foreground text-xs'>
                    {sortColumn === key
                      ? sortDirection === 'asc'
                        ? '▲'
                        : '▼'
                      : ''}
                  </span>
                </button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((position) => (
            <TableRow key={position.position_id}>
              <TableCell className='font-medium'>
                {position.position_id}
              </TableCell>
              <TableCell>{position.position_type}</TableCell>
              <TableCell>{position.category}</TableCell>
              <TableCell className='text-right tabular-nums'>
                {ron(position.principal)}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {position.current_rate.toFixed(2)}%
              </TableCell>
              <TableCell>{formatDateRo(position.repricing_date)}</TableCell>
              <TableCell>{formatDateRo(position.maturity_date)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
