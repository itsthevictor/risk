'use client';

import { useMemo, useState } from 'react';
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
import InfoDrawer from '@/components/custom/info-drawer';
import { MarketRiskForm } from '@/components/forms/mr-form';
import { MarketRiskKpiStrip } from '@/components/market/kpi-strip';
import { VarComparisonTable } from '@/components/market/var-table';
import { BacktestScorecardTable } from '@/components/market/backtest-table';
import { PnlExceptionsChart } from '@/components/market/pnl-exceptions-chart';
import { StressResultCard } from '@/components/market/stress-result-card';
import { ShockInputs } from '@/components/market/shock-inputs';
import { formatDateRo } from '@/lib/utils';
import {
  analyzeMarketRisk,
  fetchTickers,
  MarketRiskApiError,
  runStressTest,
} from '@/lib/api/market-risk';
import type {
  MarketRiskAnalyzeRequestParsed,
  MethodBacktest,
  StressTestRequestParsed,
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

// Mirrors backend/api/market_routes.py — acute crash windows (not full calendar
// years), plus the per-asset-class shocks prefilled alongside each one.
const STRESS_SCENARIOS = ['2020', '2022', 'custom'] as const;
type StressScenario = (typeof STRESS_SCENARIOS)[number];
const STRESS_SCENARIO_LABELS: Record<StressScenario, string> = {
  '2020': '2020 — COVID-19',
  '2022': '2022 — Rate-hike sell-off',
  custom: 'Personalizat',
};
const HISTORICAL_REPLAY_LABELS: Record<'2020' | '2022', string> = {
  '2020': 'COVID-19 (19 feb – 20 mar 2020)',
  '2022': 'Rate-hike sell-off (27 dec 2021 – 14 oct 2022)',
};
const PRESET_SHOCKS: Record<'2020' | '2022', Record<string, number>> = {
  '2020': { equity: -0.3, bond: -0.05, commodity: 0.05 },
  '2022': { equity: -0.2, bond: -0.13, commodity: 0.0 },
};

export default function MarketRiskPage() {
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [chartMethod, setChartMethod] =
    useState<keyof MethodBacktest>(PRIMARY_METHOD);

  // parametrii portofoliului din ultimul submit — folosiți ca să putem
  // re-rula stress testing fără să reafișăm formularul.
  const [baseParams, setBaseParams] =
    useState<MarketRiskAnalyzeRequestParsed | null>(null);

  const [stressOpen, setStressOpen] = useState(false);
  const [stressScenario, setStressScenario] = useState<StressScenario>('2020');
  const [shocks, setShocks] = useState<Record<string, number>>(
    PRESET_SHOCKS['2020'],
  );

  const tickersQuery = useQuery({
    queryKey: ['tickers'],
    queryFn: fetchTickers,
    staleTime: Infinity,
  });

  const analysis = useMutation({
    mutationFn: (values: MarketRiskAnalyzeRequestParsed) =>
      analyzeMarketRisk(values),
    onError: (error) => {
      console.error('[market-risk] analysis mutation error', error);
    },
  });

  const historicalStress = useMutation({
    mutationFn: (values: StressTestRequestParsed) => runStressTest(values),
  });
  const hypotheticalStress = useMutation({
    mutationFn: (values: StressTestRequestParsed) => runStressTest(values),
  });

  const tickerOptions = useMemo(
    () =>
      (tickersQuery.data?.tickers ?? []).map((t) => ({
        value: t.symbol,
        label: `${t.symbol} — ${t.name}`,
      })),
    [tickersQuery.data],
  );

  // Asset classes actually present in the analyzed portfolio — drives which shock
  // inputs are shown (no point offering a "bond" shock for an all-equity portfolio).
  const portfolioAssetClasses = useMemo(() => {
    if (!baseParams || !tickersQuery.data) return [];
    const byTicker = new Map(
      tickersQuery.data.tickers.map((t) => [t.symbol, t.asset_class]),
    );
    const classes = new Set(
      baseParams.tickers.map((t) => byTicker.get(t) ?? 'equity'),
    );
    return Array.from(classes);
  }, [baseParams, tickersQuery.data]);

  const handleInitialSubmit = (values: MarketRiskAnalyzeRequestParsed) => {
    console.debug('[market-risk] form submit', values);
    setBaseParams(values);
    analysis.mutate(values);
  };

  const runHypothetical = (
    params: MarketRiskAnalyzeRequestParsed,
    shockValues: Record<string, number>,
  ) => {
    hypotheticalStress.mutate({
      tickers: params.tickers,
      portfolio_value: params.portfolio_value,
      mode: 'hypothetical',
      shocks: shockValues,
    });
  };

  const handleScenarioChange = (value: string | null) => {
    if (!value) return;
    const scenario = value as StressScenario;
    setStressScenario(scenario);

    const initialShocks =
      scenario === 'custom'
        ? Object.fromEntries(portfolioAssetClasses.map((c) => [c, 0]))
        : PRESET_SHOCKS[scenario];
    setShocks(initialShocks);

    if (!baseParams) return;
    if (scenario === '2020' || scenario === '2022') {
      historicalStress.mutate({
        tickers: baseParams.tickers,
        portfolio_value: baseParams.portfolio_value,
        mode: 'historical',
        window: scenario,
      });
      runHypothetical(baseParams, initialShocks);
    } else {
      historicalStress.reset();
      hypotheticalStress.reset();
    }
  };

  const handleShockChange = (assetClass: string, value: number) => {
    setShocks((prev) => ({ ...prev, [assetClass]: value }));
  };

  const handleRecalculateShocks = () => {
    if (!baseParams) return;
    runHypothetical(baseParams, shocks);
  };

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
              Calculat la {formatDateRo(analysis.data.portfolio.end_date)}, pe
              baza întregului istoric disponibil.
            </p>
          </div>

          <Tabs
            value={String(confidenceLevel)}
            onValueChange={(v) => setConfidenceLevel(Number(v))}
          >
            <TabsList>
              {CONFIDENCE_LEVELS.map((cl) => (
                <TabsTrigger
                  key={cl}
                  value={String(cl)}
                  data-umami-event={`mr-confidence-level-${cl}-click`}
                >
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
            actualPnl={analysis.data.actual_pnl}
          />

          <div className='space-y-3 border-t pt-6'>
            <div className='space-y-1'>
              <div className='flex items-center gap-1'>
                <h2 className='text-lg font-semibold'>Backtest complet</h2>
                <InfoDrawer
                  title='Backtest complet'
                  definition='Click pe o metodă din tabel (sau pe iconița grafic din dreptul ei) pentru a actualiza graficul depășirilor de mai jos.'
                />
              </div>
              <p className='text-muted-foreground text-sm'>
                Kupiec, Christoffersen și lumina de semafor pentru fiecare
                metodă, calculate pe tot istoricul disponibil (
                {analysis.data.backtest[PRIMARY_METHOD].total_observations}{' '}
                observații).
              </p>
            </div>
            <BacktestScorecardTable
              data={analysis.data.backtest}
              activeMethod={chartMethod}
              onSelectMethod={setChartMethod}
            />
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
                  Impactul asupra portofoliului de <strong>azi</strong> — nu cum
                  s-a comportat modelul de VaR, ci ce s-ar întâmpla cu valoarea
                  curentă dacă s-ar repeta un scenariu de criză.
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  setStressOpen((open) => !open);
                  if (!stressOpen) handleScenarioChange(stressScenario);
                }}
              >
                {stressOpen ? 'Ascunde' : 'Arată'}
              </Button>
            </div>

            {stressOpen && (
              <div className='space-y-4'>
                <div className='space-y-1'>
                  <label className='text-sm font-medium'>Scenariu</label>
                  <Select
                    value={stressScenario}
                    onValueChange={handleScenarioChange}
                  >
                    <SelectTrigger className='w-56'>
                      <SelectValue>
                        {(v: StressScenario) => STRESS_SCENARIO_LABELS[v]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {STRESS_SCENARIOS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STRESS_SCENARIO_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {stressScenario !== 'custom' && (
                    <div className='space-y-2'>
                      {historicalStress.isError && (
                        <p className='text-destructive text-sm'>
                          {historicalStress.error instanceof MarketRiskApiError
                            ? historicalStress.error.message
                            : 'A apărut o eroare la calculul replay-ului istoric.'}
                        </p>
                      )}
                      {historicalStress.isPending && (
                        <p className='text-muted-foreground text-sm'>
                          Se calculează…
                        </p>
                      )}
                      {historicalStress.data && (
                        <StressResultCard
                          title='Replay istoric'
                          description={
                            HISTORICAL_REPLAY_LABELS[
                              stressScenario as '2020' | '2022'
                            ]
                          }
                          result={historicalStress.data}
                        />
                      )}
                    </div>
                  )}

                  <div className='space-y-2'>
                    {hypotheticalStress.isError && (
                      <p className='text-destructive text-sm'>
                        {hypotheticalStress.error instanceof MarketRiskApiError
                          ? hypotheticalStress.error.message
                          : 'A apărut o eroare la calculul scenariului.'}
                      </p>
                    )}
                    {hypotheticalStress.isPending && (
                      <p className='text-muted-foreground text-sm'>
                        Se calculează…
                      </p>
                    )}
                    {hypotheticalStress.data && (
                      <StressResultCard
                        title='Scenariu parametric'
                        description='Șoc pe clase de active, ponderat cu compoziția portofoliului'
                        result={hypotheticalStress.data}
                      />
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Șocuri per clasă de active
                  </label>
                  <ShockInputs
                    assetClasses={portfolioAssetClasses}
                    shocks={shocks}
                    onChange={handleShockChange}
                    disabled={hypotheticalStress.isPending}
                  />
                  <Button
                    type='button'
                    size='sm'
                    disabled={hypotheticalStress.isPending}
                    onClick={handleRecalculateShocks}
                  >
                    Recalculează
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
