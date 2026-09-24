'use client';

import { useQuery } from '@tanstack/react-query';
import Link from '@/components/locale-link';
import { PositionsTable } from '@/components/interest-rate/positions-table';
import {
  fetchPositions,
  InterestRateRiskApiError,
} from '@/lib/api/interest-rate-risk';
import { useDictionary } from '@/providers/i18n-provider';

export default function InterestRateDataPage() {
  const { data: t } = useDictionary().interestRate;
  const positionsQuery = useQuery({
    queryKey: ['irrbb-positions'],
    queryFn: fetchPositions,
  });

  return (
    <div className='w-full space-y-6 p-6 max-w-6xl mx-auto'>
      <div className='space-y-1'>
        <Link
          href='/interest-rate'
          className='text-muted-foreground text-sm hover:underline'
          data-umami-event='interest-rate-data-back-link'
        >
          {t.back}
        </Link>
        <h1 className='text-2xl font-bold'>{t.title}</h1>
        <p className='text-muted-foreground text-sm'>{t.description}</p>
      </div>

      {positionsQuery.isPending && (
        <p className='text-muted-foreground text-sm'>{t.loading}</p>
      )}

      {positionsQuery.isError && (
        <p className='text-destructive text-sm'>
          {positionsQuery.error instanceof InterestRateRiskApiError
            ? positionsQuery.error.message
            : t.error}
        </p>
      )}

      {positionsQuery.data && (
        <PositionsTable data={positionsQuery.data.positions} />
      )}
    </div>
  );
}
