'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketRiskForm } from '@/components/forms/mr-form';
import { MarketRiskKpiStrip } from '@/components/market/kpi-strip';
import { VarComparisonTable } from '@/components/market/var-table';
import {
  analyzeMarketRisk,
  fetchTickers,
  MarketRiskApiError,
} from '@/lib/api/market-risk';
import type { MarketRiskAnalyzeRequestParsed } from '@/lib/definitions';

const CONFIDENCE_LEVELS = [0.9, 0.95, 0.99] as const;

export default function MarketRiskPage() {
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);

  // Fetch o data, cached permanent - universul commbobox nu se schimbă în timpul unei sesiuni.
  const tickersQuery = useQuery({
    queryKey: ['tickers'],
    queryFn: fetchTickers,
    staleTime: Infinity,
  });

  const analysis = useMutation({
    mutationFn: (values: MarketRiskAnalyzeRequestParsed) =>
      analyzeMarketRisk(values),
  });

  const tickerOptions = useMemo(
    () =>
      (tickersQuery.data?.tickers ?? []).map((t) => ({
        value: t.symbol,
        label: `${t.symbol} — ${t.name}`,
      })),
    [tickersQuery.data],
  );

  return (
    <div className='space-y-6 p-6'>
      <MarketRiskForm
        tickerOptions={tickerOptions}
        isSubmitting={analysis.isPending}
        onSubmit={(values) => analysis.mutate(values)}
      />

      {analysis.isError && (
        <p className='text-destructive text-sm'>
          {analysis.error instanceof MarketRiskApiError
            ? analysis.error.message
            : 'Something went wrong running the analysis.'}
        </p>
      )}

      {analysis.isPending && (
        <p className='text-muted-foreground text-sm'>Running analysis…</p>
      )}

      {analysis.data && (
        <>
          <Tabs
            value={String(confidenceLevel)}
            onValueChange={(v) => setConfidenceLevel(Number(v))}
          >
            <TabsList>
              {CONFIDENCE_LEVELS.map((cl) => (
                <TabsTrigger key={cl} value={String(cl)}>
                  {(cl * 100).toFixed(0)}%
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <MarketRiskKpiStrip
            data={analysis.data}
            confidenceLevel={confidenceLevel}
          />

          <VarComparisonTable
            varComparison={analysis.data.var_comparison}
            confidenceLevel={confidenceLevel}
          />
        </>
      )}
    </div>
  );
}
