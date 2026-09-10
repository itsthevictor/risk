'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PositionsTable } from '@/components/interest-rate/positions-table';
import {
  fetchPositions,
  InterestRateRiskApiError,
} from '@/lib/api/interest-rate-risk';

export default function InterestRateDataPage() {
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
        >
          ← Risc de dobândă — IRRBB
        </Link>
        <h1 className='text-2xl font-bold'>Date și metodologie</h1>
        <p className='text-muted-foreground text-sm'>
          Încât scopul portofoliului este acela de a exemplifica implementarea
          corectă a algoritmilor de calcul IRRBB, am generat și folosit 100 de
          rânduri de poziții fictive (mockaroo). În prepararea datelor am
          asigurat coerența între datele de repricing și maturitate pentru
          fiecare categorie de poziții, cât și între diferitele categorii de
          poziții.
        </p>
      </div>

      {positionsQuery.isPending && (
        <p className='text-muted-foreground text-sm'>Se încarcă…</p>
      )}

      {positionsQuery.isError && (
        <p className='text-destructive text-sm'>
          {positionsQuery.error instanceof InterestRateRiskApiError
            ? positionsQuery.error.message
            : 'A apărut o eroare la încărcarea datelor.'}
        </p>
      )}

      {positionsQuery.data && (
        <PositionsTable data={positionsQuery.data.positions} />
      )}
    </div>
  );
}
