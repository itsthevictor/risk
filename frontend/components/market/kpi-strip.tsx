import type {
  MarketRiskAnalyzeResponse,
  MethodBacktest,
} from '@/lib/definitions';
import { formatPercent, formatUsd } from '@/lib/utils';
import { KpiCard } from './kpi-card';
import { worstTrafficLight } from './traffic-light-badge';

const METHOD_LABELS: Record<keyof MethodBacktest, string> = {
  historical: 'Historical Sim',
  parametric: 'Parametric',
  ewma: 'Parametric (EWMA)',
  garch: 'Parametric (GARCH)',
  monte_carlo: 'Monte Carlo',
};

export interface MarketRiskKpiStripProps {
  data: MarketRiskAnalyzeResponse;
  confidenceLevel: number;
  primaryMethod?: keyof MethodBacktest;
}

export function MarketRiskKpiStrip({
  data,
  confidenceLevel,
  primaryMethod = 'historical',
}: MarketRiskKpiStripProps) {
  const confResult = data.var_comparison.find(
    (c) => c.confidence_level === confidenceLevel,
  );
  const headline = confResult?.methods[primaryMethod];
  const latestGarchVol =
    data.volatility_forecast.garch[data.volatility_forecast.garch.length - 1];

  const methodKeys = Object.keys(data.backtest) as (keyof MethodBacktest)[];
  const worstStatus = worstTrafficLight(
    methodKeys.map((method) => data.backtest[method].traffic_light),
  );

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-5'>
      <KpiCard
        label={`VaR — ${METHOD_LABELS[primaryMethod]}`}
        value={headline ? formatUsd(headline.var) : '—'}
        subValue={headline ? `ES ${formatUsd(headline.es)}` : undefined}
      />
      <KpiCard
        label='Volatility (GARCH)'
        value={
          latestGarchVol !== undefined ? formatPercent(latestGarchVol) : '—'
        }
      />
      <KpiCard
        label='Max Drawdown'
        value={formatPercent(data.drawdown.max_drawdown)}
      />
      <KpiCard
        label='Diversification Benefit'
        value={formatUsd(data.diversification.diversification_benefit)}
        subValue={formatPercent(
          data.diversification.diversification_benefit_pct,
        )}
      />
      <KpiCard
        label='Backtest Status'
        value={worstStatus.toUpperCase()}
        status={worstStatus}
      />
    </div>
  );
}
