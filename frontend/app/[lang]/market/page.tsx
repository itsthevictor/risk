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
import { IconInfoCircle, IconLoader2 } from '@tabler/icons-react';
import InfoDrawer from '@/components/custom/info-drawer';
import { MarketRiskForm } from '@/components/forms/mr-form';
import { MarketRiskKpiStrip } from '@/components/market/kpi-strip';
import { VarComparisonTable } from '@/components/market/var-table';
import { BacktestScorecardTable } from '@/components/market/backtest-table';
import { PnlExceptionsChart } from '@/components/market/pnl-exceptions-chart';
import { StressResultCard } from '@/components/market/stress-result-card';
import { ShockInputs } from '@/components/market/shock-inputs';
import { formatDateRo, formatPercent } from '@/lib/utils';
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
import { fmt } from '@/lib/i18n/config';
import { useDictionary } from '@/providers/i18n-provider';

const CONFIDENCE_LEVELS = [0.9, 0.95, 0.99] as const;
const PRIMARY_METHOD: keyof MethodBacktest = 'historical';

// Mirrors backend/api/market_routes.py — acute crash windows (not full calendar
// years), plus the per-asset-class shocks prefilled alongside each one.
const STRESS_SCENARIOS = ['2020', '2022', 'custom'] as const;
type StressScenario = (typeof STRESS_SCENARIOS)[number];
const PRESET_SHOCKS: Record<'2020' | '2022', Record<string, number>> = {
  '2020': {
    equity: -0.3,
    bond: -0.05,
    commodity: 0.05,
    fx: -0.03,
    crypto: -0.5,
  },
  '2022': {
    equity: -0.2,
    bond: -0.13,
    commodity: 0.0,
    fx: -0.08,
    crypto: -0.65,
  },
};

export default function MarketRiskPage() {
  const { market, common } = useDictionary();
  const { page: t, stress } = market;
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [chartMethod, setChartMethod] =
    useState<keyof MethodBacktest>(PRIMARY_METHOD);

  // parametrii portofoliului din ultimul submit — folosiți ca să putem
  // re-rula stress testing fără să reafișăm formularul.
  const [baseParams, setBaseParams] =
    useState<MarketRiskAnalyzeRequestParsed | null>(null);

  const [stressOpen, setStressOpen] = useState(true);
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

    const byTicker = new Map(
      (tickersQuery.data?.tickers ?? []).map((t) => [t.symbol, t.asset_class]),
    );
    const assetClasses = Array.from(
      new Set(values.tickers.map((t) => byTicker.get(t) ?? 'equity')),
    );
    const initialShocks =
      stressScenario === 'custom'
        ? Object.fromEntries(assetClasses.map((c) => [c, -0.15]))
        : PRESET_SHOCKS[stressScenario];
    setShocks(initialShocks);

    if (stressScenario === '2020' || stressScenario === '2022') {
      historicalStress.mutate({
        tickers: values.tickers,
        portfolio_value: values.portfolio_value,
        mode: 'historical',
        window: stressScenario,
      });
      runHypothetical(values, initialShocks);
    } else {
      historicalStress.reset();
      hypotheticalStress.reset();
    }
  };

  const handleReset = () => {
    analysis.reset();
    setBaseParams(null);
    setStressOpen(true);
    setStressScenario('2020');
    setShocks(PRESET_SHOCKS['2020']);
    historicalStress.reset();
    hypotheticalStress.reset();
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
        ? Object.fromEntries(portfolioAssetClasses.map((c) => [c, -0.15]))
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
        hasResult={!!analysis.data}
        onSubmit={handleInitialSubmit}
        onReset={handleReset}
      />

      {tickersQuery.isError && (
        <p className='text-destructive text-sm'>
          {t.tickersError}
          {tickersQuery.error instanceof MarketRiskApiError
            ? `: ${tickersQuery.error.message}`
            : '.'}
        </p>
      )}

      {analysis.isError && (
        <p className='text-destructive text-sm'>
          {analysis.error instanceof MarketRiskApiError
            ? analysis.error.message
            : t.analysisError}
        </p>
      )}

      {!analysis.isPending && !analysis.data && (
        <div className='text-foreground bg-accent mx-auto flex w-fit flex-row items-center gap-4 rounded-lg p-4 text-sm'>
          <IconInfoCircle className='shrink-0' />
          <div className='max-w-sm'>
            <p>{t.intro}</p>
            <p className='text-muted-foreground mt-2 text-xs'>{t.introNote}</p>
          </div>
        </div>
      )}

      {analysis.isPending && (
        <div className='text-foreground bg-accent mx-auto flex w-fit flex-row items-center gap-4 rounded-lg p-4 text-sm'>
          <IconLoader2 className='text-muted-foreground h-5 w-5 shrink-0 animate-spin' />
          <div className='max-w-sm'>
            <p className='font-medium'>{t.running}</p>
            <p className='text-muted-foreground text-xs'>{t.runningDetail}</p>
          </div>
        </div>
      )}

      {analysis.data && (
        <>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>{t.currentRisk}</h2>
            <p className='text-muted-foreground text-sm'>
              {fmt(t.computedAt, {
                date: formatDateRo(analysis.data.portfolio.end_date),
              })}
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

          <MarketRiskKpiStrip data={analysis.data} />

          <VarComparisonTable
            varComparison={analysis.data.var_comparison}
            confidenceLevel={confidenceLevel}
            actualPnl={analysis.data.actual_pnl}
          />

          <div className='space-y-3 border-t pt-6'>
            <div className='space-y-1'>
              <div className='flex items-center gap-1'>
                <h2 className='text-lg font-semibold'>
                  {market.backtest.title}
                </h2>
                <InfoDrawer
                  title={market.backtest.title}
                  definition={market.backtest.info}
                />
              </div>
              <p className='text-muted-foreground text-sm'>
                {fmt(market.backtest.description, {
                  count:
                    analysis.data.backtest[PRIMARY_METHOD].total_observations,
                })}
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
              methodLabel={market.methods[chartMethod]}
            />
          </div>

          <div className='space-y-3 border-t pt-6'>
            <div className='flex items-center justify-between gap-2'>
              <div className='space-y-1'>
                <h2 className='text-lg font-semibold'>{stress.title}</h2>
                <p className='text-muted-foreground text-sm'>
                  {stress.descriptionBefore} <strong>{stress.today}</strong>{' '}
                  {stress.descriptionAfter}
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setStressOpen((open) => !open)}
              >
                {stressOpen ? stress.hide : stress.show}
              </Button>
            </div>

            {stressOpen && (
              <div className='space-y-4'>
                <div className='space-y-1'>
                  <label className='text-sm font-medium'>
                    {stress.scenario}
                  </label>
                  <Select
                    value={stressScenario}
                    onValueChange={handleScenarioChange}
                  >
                    <SelectTrigger className='w-56'>
                      <SelectValue>
                        {(v: StressScenario) => stress.scenarios[v]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {STRESS_SCENARIOS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {stress.scenarios[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {stressScenario !== 'custom' && (
                  <div className='text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
                    <span className='font-medium'>{stress.presetShocks}</span>
                    {Object.entries(PRESET_SHOCKS[stressScenario]).map(
                      ([cls, shock]) => (
                        <span key={cls} className='tabular-nums'>
                          {market.assetClasses[cls] ?? cls}:{' '}
                          {formatPercent(shock)}
                        </span>
                      ),
                    )}
                  </div>
                )}

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {stressScenario !== 'custom' && (
                    <div className='space-y-2'>
                      {historicalStress.isError && (
                        <p className='text-destructive text-sm'>
                          {historicalStress.error instanceof MarketRiskApiError
                            ? historicalStress.error.message
                            : stress.historicalError}
                        </p>
                      )}
                      {historicalStress.isPending && (
                        <p className='text-muted-foreground text-sm'>
                          {common.calculating}
                        </p>
                      )}
                      {historicalStress.data && (
                        <StressResultCard
                          title={stress.historicalReplay}
                          description={
                            stress.replayWindows[
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
                          : stress.hypotheticalError}
                      </p>
                    )}
                    {hypotheticalStress.isPending && (
                      <p className='text-muted-foreground text-sm'>
                        {common.calculating}
                      </p>
                    )}
                    {hypotheticalStress.data && (
                      <StressResultCard
                        title={stress.appliedScenario}
                        description={stress.appliedScenarioDescription}
                        result={hypotheticalStress.data}
                      />
                    )}
                  </div>
                </div>

                {stressScenario === 'custom' && (
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>
                      {stress.customShocks}
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
                      {stress.recalculate}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
