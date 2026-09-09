'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NiiKpiStrip } from '@/components/interest-rate/nii-kpi-strip';
import { NiiScenarioTable } from '@/components/interest-rate/nii-scenario-table';
import { EveKpiStrip } from '@/components/interest-rate/eve-kpi-strip';
import { EveScenarioTable } from '@/components/interest-rate/eve-scenario-table';
import {
  fetchEveAnalysis,
  fetchNiiAnalysis,
  InterestRateRiskApiError,
} from '@/lib/api/interest-rate-risk';
import { formatDateRo } from '@/lib/utils';

const SHOCK_OPTIONS = [100, 200, 300] as const;

export default function InterestRatePage() {
  const [shockBp, setShockBp] = useState<number>(200);

  const niiQuery = useQuery({
    queryKey: ['irrbb-nii', shockBp],
    queryFn: () => fetchNiiAnalysis(shockBp),
  });

  const eveQuery = useQuery({
    queryKey: ['irrbb-eve'],
    queryFn: fetchEveAnalysis,
  });

  return (
    <div className='w-full space-y-6 p-6 max-w-6xl mx-auto'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-bold'>Risc de dobândă — IRRBB</h1>
        <p className='text-muted-foreground text-sm'>
          Interest Rate Risk in the Banking Book — Net Interest Income (NII) și
          sensibilitatea acestuia la un șoc paralel de rată.
        </p>
      </div>

      <Tabs defaultValue='nii'>
        <TabsList>
          <TabsTrigger value='nii'>NII</TabsTrigger>
          <TabsTrigger value='eve'>EVE</TabsTrigger>
        </TabsList>

        <TabsContent value='nii' className='w-full min-w-0 space-y-6 pt-4'>
          <div className='flex flex-wrap items-center justify-between gap-2 w-full'>
            <p className='text-muted-foreground text-sm'>
              {niiQuery.data &&
                `Calculat la ${formatDateRo(niiQuery.data.as_of_date)}, orizont de ${niiQuery.data.horizon_days} zile.`}
            </p>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Mărime șoc</label>
              <Select
                value={String(shockBp)}
                onValueChange={(v) => v && setShockBp(Number(v))}
              >
                <SelectTrigger className='w-32'>
                  <SelectValue>{() => `${shockBp} bps`}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SHOCK_OPTIONS.map((bp) => (
                    <SelectItem key={bp} value={String(bp)}>
                      {bp} bps
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {niiQuery.isPending && (
            <p className='text-muted-foreground text-sm'>Se calculează…</p>
          )}

          {niiQuery.isError && (
            <p className='text-destructive text-sm'>
              {niiQuery.error instanceof InterestRateRiskApiError
                ? niiQuery.error.message
                : 'A apărut o eroare la calculul NII.'}
            </p>
          )}

          {niiQuery.data && (
            <>
              <NiiKpiStrip data={niiQuery.data} />
              <NiiScenarioTable data={niiQuery.data} />
            </>
          )}
        </TabsContent>

        <TabsContent value='eve' className='w-full min-w-0 space-y-6 pt-4'>
          <p className='text-muted-foreground text-sm'>
            {eveQuery.data &&
              `Calculat la ${formatDateRo(eveQuery.data.as_of_date)}, pe baza curbei de randament curente și a 6 scenarii de șoc standard IRRBB.`}
          </p>

          {eveQuery.isPending && (
            <p className='text-muted-foreground text-sm'>Se calculează…</p>
          )}

          {eveQuery.isError && (
            <p className='text-destructive text-sm'>
              {eveQuery.error instanceof InterestRateRiskApiError
                ? eveQuery.error.message
                : 'A apărut o eroare la calculul EVE.'}
            </p>
          )}

          {eveQuery.data && (
            <>
              <EveKpiStrip data={eveQuery.data} />
              <EveScenarioTable data={eveQuery.data} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
