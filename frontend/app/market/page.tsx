'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerPopover } from '@/components/forms/form-components';
import { MarketRiskForm } from '@/components/forms/mr-form';
import { MarketRiskKpiStrip } from '@/components/market/kpi-strip';
import { VarComparisonTable } from '@/components/market/var-table';
import { BacktestScorecardTable } from '@/components/market/backtest-table';
import { PnlExceptionsChart } from '@/components/market/pnl-exceptions-chart';
import {
  analyzeMarketRisk,
  fetchTickers,
  MarketRiskApiError,
} from '@/lib/api/market-risk';
import type {
  MarketRiskAnalyzeRequestParsed,
  MarketRiskAnalyzeResponse,
  MethodBacktest,
} from '@/lib/definitions';

const CONFIDENCE_LEVELS = [0.9, 0.95, 0.99] as const;
const PRIMARY_METHOD: keyof MethodBacktest = 'historical';
const METHOD_LABELS: Record<keyof MethodBacktest, string> = {
  historical: 'Simulare Istorică',
  parametric: 'Parametric',
  ewma: 'Parametric (EWMA)',
  garch: 'Parametric (GARCH)',
  monte_carlo: 'Monte Carlo',
};
const METHOD_ORDER = Object.keys(METHOD_LABELS) as (keyof MethodBacktest)[];
const STRESS_WINDOWS = ['full', '2020', '2022', 'custom'] as const;
type StressWindow = (typeof STRESS_WINDOWS)[number];
const STRESS_WINDOW_LABELS: Record<StressWindow, string> = {
  full: 'Tot istoricul',
  '2020': '2020',
  '2022': '2022',
  custom: 'Personalizat',
};

export default function MarketRiskPage() {
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [chartMethod, setChartMethod] =
    useState<keyof MethodBacktest>(PRIMARY_METHOD);

  // parametrii portofoliului din ultimul submit — folosiți ca să putem
  // re-rula analiza de stress testing fără să reafișăm formularul.
  const [baseParams, setBaseParams] =
    useState<MarketRiskAnalyzeRequestParsed | null>(null);

  const [stressOpen, setStressOpen] = useState(false);
  const [stressWindow, setStressWindow] = useState<StressWindow>('full');
  const [customStart, setCustomStart] = useState<Date>();
  const [customEnd, setCustomEnd] = useState<Date>();

  const tickersQuery = useQuery({
    queryKey: ['tickers'],
    queryFn: fetchTickers,
    staleTime: Infinity,
  });

  const analysis = useMutation({
    mutationFn: (values: MarketRiskAnalyzeRequestParsed) =>
      analyzeMarketRisk(values),
  });

  // Separate mutation for the stress-test slice, so switching crisis windows
  // never overwrites the full-history data driving the KPI strip / tables above.
  const stressAnalysis = useMutation({
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
    setStressWindow('full');
    analysis.mutate(values);
  };

  const handleStressWindowChange = (value: string | null) => {
    if (!value) return;
    const window = value as StressWindow;
    setStressWindow(window);
    if (!baseParams) return;
    // 'full' reuses the already-loaded full-history data below — no request needed.
    if (window === '2020' || window === '2022') {
      stressAnalysis.mutate({
        ...baseParams,
        crisis_window: window,
        custom_window: null,
      });
    }
  };

  const handleApplyCustomWindow = () => {
    if (!baseParams || !customStart || !customEnd) return;
    stressAnalysis.mutate({
      ...baseParams,
      crisis_window: 'custom',
      custom_window: {
        start: format(customStart, 'yyyy-MM-dd'),
        end: format(customEnd, 'yyyy-MM-dd'),
      },
    });
  };

  const stressData: MarketRiskAnalyzeResponse | undefined =
    stressWindow === 'full' ? analysis.data : stressAnalysis.data;
  const stressPending = stressWindow !== 'full' && stressAnalysis.isPending;
  const stressErrorMessage =
    stressWindow !== 'full' && stressAnalysis.isError
      ? stressAnalysis.error instanceof MarketRiskApiError
        ? stressAnalysis.error.message
        : 'A apărut o eroare la rularea stress testului.'
      : null;

  return (
    <div className='space-y-6 p-6'>
      <MarketRiskForm
        tickerOptions={tickerOptions}
        isSubmitting={analysis.isPending}
        onSubmit={handleInitialSubmit}
      />

      {tickersQuery.isError && (
        <p className='text-destructive text-sm'>
          Nu s-a putut încărca lista de tickere — verifică dacă backend-ul
          rulează
          {tickersQuery.error instanceof MarketRiskApiError
            ? `: ${tickersQuery.error.message}`
            : '.'}
        </p>
      )}

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
              Calculat la {analysis.data.portfolio.end_date}, pe baza întregului
              istoric disponibil.
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
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>Backtest complet</h2>
              <p className='text-muted-foreground text-sm'>
                Kupiec, Christoffersen și lumina de semafor pentru fiecare
                metodă, calculate pe tot istoricul disponibil (
                {analysis.data.backtest[PRIMARY_METHOD].total_observations}{' '}
                observații).
              </p>
            </div>
            <BacktestScorecardTable data={analysis.data.backtest} />

            <div className='space-y-1'>
              <label className='text-sm font-medium'>
                Metodă (grafic depășiri)
              </label>
              <Select
                value={chartMethod}
                onValueChange={(v) =>
                  v && setChartMethod(v as keyof MethodBacktest)
                }
              >
                <SelectTrigger className='w-56'>
                  <SelectValue>
                    {(v: keyof MethodBacktest) => METHOD_LABELS[v]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {METHOD_ORDER.map((m) => (
                    <SelectItem key={m} value={m}>
                      {METHOD_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <PnlExceptionsChart
              pnl={analysis.data.actual_pnl}
              breachDates={analysis.data.backtest[chartMethod].breach_dates}
              varSeries={analysis.data.backtest[chartMethod].var_series}
              methodLabel={METHOD_LABELS[chartMethod]}
            />
          </div>

          <div className='space-y-3 border-t pt-6'>
            <div className='flex items-center justify-between gap-2'>
              <div className='space-y-1'>
                <h2 className='text-lg font-semibold'>Stress Testing</h2>
                <p className='text-muted-foreground text-sm'>
                  Decupaj din analiza de mai sus pentru o perioadă de stres
                  istorică — fără recalcul.
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setStressOpen((open) => !open)}
              >
                {stressOpen ? 'Ascunde' : 'Arată'}
              </Button>
            </div>

            {stressOpen && (
              <div className='space-y-4'>
                <div className='flex flex-wrap items-end gap-3'>
                  <div className='space-y-1'>
                    <label className='text-sm font-medium'>Fereastră</label>
                    <Select
                      value={stressWindow}
                      onValueChange={handleStressWindowChange}
                    >
                      <SelectTrigger className='w-44'>
                        <SelectValue>
                          {(v: StressWindow) => STRESS_WINDOW_LABELS[v]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {STRESS_WINDOWS.map((w) => (
                          <SelectItem key={w} value={w}>
                            {STRESS_WINDOW_LABELS[w]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {stressWindow === 'custom' && (
                    <>
                      <div className='space-y-1'>
                        <label className='text-sm font-medium'>Start</label>
                        <DatePickerPopover
                          date={customStart}
                          onDateChange={setCustomStart}
                        />
                      </div>
                      <div className='space-y-1'>
                        <label className='text-sm font-medium'>Sfârșit</label>
                        <DatePickerPopover
                          date={customEnd}
                          onDateChange={setCustomEnd}
                        />
                      </div>
                      <Button
                        type='button'
                        size='sm'
                        disabled={
                          !customStart || !customEnd || stressAnalysis.isPending
                        }
                        onClick={handleApplyCustomWindow}
                      >
                        Aplică
                      </Button>
                    </>
                  )}
                </div>

                {stressErrorMessage && (
                  <p className='text-destructive text-sm'>
                    {stressErrorMessage}
                  </p>
                )}
                {stressPending && (
                  <p className='text-muted-foreground text-sm'>Se rulează…</p>
                )}
                {stressData &&
                  (stressData.actual_pnl.dates.length === 0 ? (
                    <p className='text-muted-foreground text-sm'>
                      Nu există date pentru intervalul selectat.
                    </p>
                  ) : (
                    <>
                      <p className='text-muted-foreground text-sm'>
                        {
                          stressData.backtest[chartMethod].breach_dates.filter(
                            (d) => stressData.actual_pnl.dates.includes(d),
                          ).length
                        }{' '}
                        depășiri VaR ({METHOD_LABELS[chartMethod]}) în
                        intervalul selectat, drawdown maxim{' '}
                        {(stressData.drawdown.max_drawdown * 100).toFixed(1)}%
                        pe tot istoricul.
                      </p>
                      <PnlExceptionsChart
                        pnl={stressData.actual_pnl}
                        breachDates={
                          stressData.backtest[chartMethod].breach_dates
                        }
                        varSeries={stressData.backtest[chartMethod].var_series}
                        methodLabel={METHOD_LABELS[chartMethod]}
                      />
                    </>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
