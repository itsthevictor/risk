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
import Link from '@/components/locale-link';
import { fmt } from '@/lib/i18n/config';
import { useDictionary } from '@/providers/i18n-provider';

const SHOCK_OPTIONS = [100, 200, 300] as const;

export default function InterestRatePage() {
  const { interestRate: t, common } = useDictionary();
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
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold'>{t.title}</h1>
          <p className='text-muted-foreground text-sm'>{t.subtitle}</p>
        </div>
        <Link
          href='/interest-rate/data'
          className='text-muted-foreground text-sm hover:underline'
          data-umami-event='interest-rate-data-link'
        >
          {t.dataLink}
        </Link>
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
                fmt(t.niiComputedAt, {
                  date: formatDateRo(niiQuery.data.as_of_date),
                  days: niiQuery.data.horizon_days,
                })}
            </p>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>{t.shockSize}</label>
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
            <p className='text-muted-foreground text-sm'>
              {common.calculating}
            </p>
          )}

          {niiQuery.isError && (
            <p className='text-destructive text-sm'>
              {niiQuery.error instanceof InterestRateRiskApiError
                ? niiQuery.error.message
                : t.niiError}
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
              fmt(t.eveComputedAt, {
                date: formatDateRo(eveQuery.data.as_of_date),
              })}
          </p>

          {eveQuery.isPending && (
            <p className='text-muted-foreground text-sm'>
              {common.calculating}
            </p>
          )}

          {eveQuery.isError && (
            <p className='text-destructive text-sm'>
              {eveQuery.error instanceof InterestRateRiskApiError
                ? eveQuery.error.message
                : t.eveError}
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
