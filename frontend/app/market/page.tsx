'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
const BACKTEST_WINDOWS = ['2020', '2022'] as const;

export default function MarketRiskPage() {
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [backtestWindow, setBacktestWindow] =
    useState<(typeof BACKTEST_WINDOWS)[number]>('2022');

  // parametrii portofoliului din ultimul submit — folosiți ca să putem
  // re-rula analiza doar cu o fereastră de backtest diferită, fără să
  // reafișăm formularul.
  const [baseParams, setBaseParams] =
    useState<MarketRiskAnalyzeRequestParsed | null>(null);

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

  const handleInitialSubmit = (values: MarketRiskAnalyzeRequestParsed) => {
    setBaseParams(values);
    analysis.mutate(values);
  };

  const handleBacktestWindowChange = (
    value: (typeof BACKTEST_WINDOWS)[number] | null,
  ) => {
    if (!value) return;
    setBacktestWindow(value);
    if (baseParams) {
      analysis.mutate({ ...baseParams, crisis_window: value });
    }
  };

  return (
    <div className='space-y-6 p-6'>
      <MarketRiskForm
        tickerOptions={tickerOptions}
        isSubmitting={analysis.isPending}
        onSubmit={handleInitialSubmit}
      />

      {analysis.isError && (
        <p className='text-destructive text-sm'>
          {analysis.error instanceof MarketRiskApiError
            ? analysis.error.message
            : 'A apărut o eroare la rularea analizei.'}
        </p>
      )}

      {analysis.isPending && (
        <p className='text-muted-foreground text-sm'>Se rulează analiza…</p>
      )}

      {analysis.data && (
        <>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>Risc curent</h2>
            <p className='text-muted-foreground text-sm'>
              Calculat la {analysis.data.portfolio.end_date}.
            </p>
          </div>

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

          <div className='space-y-3 border-t pt-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>Backtest</h2>
              <Select
                value={backtestWindow}
                onValueChange={handleBacktestWindowChange}
              >
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BACKTEST_WINDOWS.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className='text-muted-foreground text-sm'>
              Cum s-ar fi comportat modelul de VaR în perioada de stres
              selectată (exceptions overlay, Kupiec, traffic-light).
            </p>
            {/* aici vin, când le construim: exceptions overlay chart + volatility forecast chart + backtest scorecard */}
          </div>
        </>
      )}
    </div>
  );
}
