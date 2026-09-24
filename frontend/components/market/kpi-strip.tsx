import type { MarketRiskAnalyzeResponse } from '@/lib/definitions';
import { formatPercent, formatUsd } from '@/lib/utils';
import { DiversificationChart } from './diversification-chart';
import { DrawdownChart } from './drawdown-chart';
import { KpiCard } from './kpi-card';
import { VolatilityForecastChart } from './volatility-forecast-chart';
import { useDictionary } from '@/providers/i18n-provider';

export interface MarketRiskKpiStripProps {
  data: MarketRiskAnalyzeResponse;
}

export function MarketRiskKpiStrip({ data }: MarketRiskKpiStripProps) {
  const { kpis } = useDictionary().market;
  const latestEwmaVol =
    data.volatility_forecast.ewma[data.volatility_forecast.ewma.length - 1];
  const latestGarchVol =
    data.volatility_forecast.garch[data.volatility_forecast.garch.length - 1];

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
      <KpiCard
        label={kpis.ewma.label}
        value={latestEwmaVol !== undefined ? formatPercent(latestEwmaVol) : '—'}
        chart={{
          title: kpis.volatilityChart.title,
          description: kpis.volatilityChart.description,
          content: <VolatilityForecastChart data={data.volatility_forecast} />,
        }}
        info={{
          title: kpis.ewma.infoTitle,
          definition: kpis.ewma.definition,
          equation:
            '\\sigma_t^2 = \\lambda \\, \\sigma_{t-1}^2 + (1-\\lambda) \\, r_{t-1}^2',
          implementation: kpis.ewma.steps,
        }}
      />
      <KpiCard
        label={kpis.garch.label}
        value={
          latestGarchVol !== undefined ? formatPercent(latestGarchVol) : '—'
        }
        chart={{
          title: kpis.volatilityChart.title,
          description: kpis.volatilityChart.description,
          content: <VolatilityForecastChart data={data.volatility_forecast} />,
        }}
        info={{
          title: kpis.garch.infoTitle,
          definition: kpis.garch.definition,
          equation:
            '\\sigma_t^2 = \\omega + \\alpha \\, \\varepsilon_{t-1}^2 + \\beta \\, \\sigma_{t-1}^2',
          implementation: kpis.garch.steps,
        }}
      />
      <KpiCard
        label={kpis.drawdown.label}
        value={formatPercent(data.drawdown.max_drawdown)}
        chart={{
          title: kpis.drawdown.chartTitle,
          description: kpis.drawdown.chartDescription,
          content: <DrawdownChart data={data.drawdown} />,
        }}
        info={{
          title: kpis.drawdown.infoTitle,
          definition: kpis.drawdown.definition,
          equation:
            'MDD = \\min_t \\left( \\frac{V_t - \\max_{s \\le t} V_s}{\\max_{s \\le t} V_s} \\right)',
          implementation: kpis.drawdown.steps,
        }}
      />
      <KpiCard
        label={kpis.diversification.label}
        value={formatUsd(data.diversification.diversification_benefit)}
        subValue={formatPercent(
          data.diversification.diversification_benefit_pct,
        )}
        chart={{
          title: kpis.diversification.chartTitle,
          description: kpis.diversification.chartDescription,
          content: <DiversificationChart data={data.diversification} />,
        }}
        info={{
          title: kpis.diversification.infoTitle,
          definition: kpis.diversification.definition,
          equation: 'DB = \\sum_i VaR_i - VaR_{portfolio}',
          implementation: kpis.diversification.steps,
        }}
      />
    </div>
  );
}
