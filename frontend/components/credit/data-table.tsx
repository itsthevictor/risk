'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from '@/components/locale-link';
import { Button } from '../ui/button';
import { fmt } from '@/lib/i18n/config';
import { useDictionary } from '@/providers/i18n-provider';

export type Status = 'inclusa' | 'indirecta' | 'ignorata';

export interface ColumnRow {
  nr: number;
  column: string;
  meaning: string;
  processing: string;
  status: Status;
}

const STATUS_CONFIG: Record<Status, { badgeClass: string; idClass: string }> = {
  inclusa: {
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    idClass: 'text-emerald-700',
  },
  indirecta: {
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    idClass: 'text-slate-500',
  },
  ignorata: {
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    idClass: 'text-red-700',
  },
};

// rows come from dataset-columns.{ro,en}.ts, picked by the server page.
export default function DatasetColumnsTable({ rows }: { rows: ColumnRow[] }) {
  const { columns: t } = useDictionary().credit;
  const counts = rows.reduce(
    (acc, r) => {
      acc[r.status] += 1;
      return acc;
    },
    { inclusa: 0, indirecta: 0, ignorata: 0 } as Record<Status, number>,
  );

  return (
    <div className='w-full font-sans text-slate-900'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <Button
            variant='outline'
            className='mb-4 text-muted-foreground hover:text-foreground'
          >
            <Link
              href='/credit'
              className='text-sm   flex items-center gap-2'
              data-umami-event='data-back-to-credit-link'
            >
              <IconArrowLeft /> {t.back}
            </Link>
          </Button>
          <h2 className='text-base font-semibold'>{t.title}</h2>
          <p className='text-sm text-slate-500'>
            {fmt(t.description, { count: rows.length })}
          </p>
        </div>
        <div className='flex gap-2 text-xs'>
          <Badge variant='outline' className={STATUS_CONFIG.inclusa.badgeClass}>
            {fmt(t.counts.inclusa, { n: counts.inclusa })}
          </Badge>
          <Badge
            variant='outline'
            className={STATUS_CONFIG.indirecta.badgeClass}
          >
            {fmt(t.counts.indirecta, { n: counts.indirecta })}
          </Badge>
          <Badge
            variant='outline'
            className={STATUS_CONFIG.ignorata.badgeClass}
          >
            {fmt(t.counts.ignorata, { n: counts.ignorata })}
          </Badge>
        </div>
      </div>

      <div className='overflow-auto rounded-md border border-slate-200 max-h-180'>
        <Table>
          <TableHeader className='sticky top-0 z-10 bg-slate-50'>
            <TableRow>
              <TableHead className='w-12'>{t.headers.nr}</TableHead>
              <TableHead className='w-52 font-mono'>
                {t.headers.column}
              </TableHead>
              <TableHead>{t.headers.meaning}</TableHead>
              <TableHead>{t.headers.processing}</TableHead>
              <TableHead className='w-28 text-right'>
                {t.headers.status}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.nr}>
                <TableCell className='font-mono text-slate-500'>
                  {r.nr}
                </TableCell>
                <TableCell
                  className={`font-mono text-xs font-medium ${STATUS_CONFIG[r.status].idClass}`}
                >
                  {r.column}
                </TableCell>
                <TableCell className='max-w-md whitespace-normal text-sm text-slate-700'>
                  {r.meaning}
                </TableCell>
                <TableCell className='max-w-xl whitespace-normal text-sm text-slate-600'>
                  {r.processing}
                </TableCell>
                <TableCell className='text-right'>
                  <Badge
                    variant='outline'
                    className={STATUS_CONFIG[r.status].badgeClass}
                  >
                    {t.status[r.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
