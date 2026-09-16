import type { MarketRiskAnalyzeResponse } from '@/lib/definitions';
import { formatPercent, formatUsd } from '@/lib/utils';
import { DiversificationChart } from './diversification-chart';
import { DrawdownChart } from './drawdown-chart';
import { KpiCard } from './kpi-card';
import { VolatilityForecastChart } from './volatility-forecast-chart';

export interface MarketRiskKpiStripProps {
  data: MarketRiskAnalyzeResponse;
}

export function MarketRiskKpiStrip({ data }: MarketRiskKpiStripProps) {
  const latestEwmaVol =
    data.volatility_forecast.ewma[data.volatility_forecast.ewma.length - 1];
  const latestGarchVol =
    data.volatility_forecast.garch[data.volatility_forecast.garch.length - 1];

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
      <KpiCard
        label='Volatilitate (EWMA)'
        value={
          latestEwmaVol !== undefined ? formatPercent(latestEwmaVol) : '—'
        }
        chart={{
          title: 'Prognoza Volatilității',
          description: 'Volatilitatea condiționată EWMA vs. GARCH în timp.',
          content: (
            <VolatilityForecastChart data={data.volatility_forecast} />
          ),
        }}
        info={{
          title: 'Prognoza Volatilității (EWMA)',
          definition:
            'Volatilitatea estimată a portofoliului printr-o medie ponderată exponențial a randamentelor pătratice trecute, care acordă greutate mai mare șocurilor recente.',
          equation:
            '\\sigma_t^2 = \\lambda \\, \\sigma_{t-1}^2 + (1-\\lambda) \\, r_{t-1}^2',
          implementation: [
            'Se inițializează varianța cu deviația standard pe fereastra de seed (252 zile)',
            'Se actualizează recursiv varianța cu factorul de decădere λ = 0.94',
            'Se exprimă ca procent (rădăcina varianței)',
          ],
        }}
      />
      <KpiCard
        label='Volatilitate (GARCH)'
        value={
          latestGarchVol !== undefined ? formatPercent(latestGarchVol) : '—'
        }
        chart={{
          title: 'Prognoza Volatilității',
          description: 'Volatilitatea condiționată EWMA vs. GARCH în timp.',
          content: (
            <VolatilityForecastChart data={data.volatility_forecast} />
          ),
        }}
        info={{
          title: 'Prognoza Volatilității (GARCH)',
          definition:
            'Volatilitatea condiționată estimată a portofoliului pentru perioada următoare, care permite șocurilor recente să crească sau să reducă riscul față de media pe termen lung.',
          equation:
            '\\sigma_t^2 = \\omega + \\alpha \\, \\varepsilon_{t-1}^2 + \\beta \\, \\sigma_{t-1}^2',
          implementation: [
            'Se calibrează un model GARCH(1,1) pe seria istorică de randamente',
            'Se estimează varianța condiționată pentru perioada următoare din parametrii calibrați',
            'Se anualizează și se exprimă ca procent',
          ],
        }}
      />
      <KpiCard
        label='Drawdown Maxim'
        value={formatPercent(data.drawdown.max_drawdown)}
        chart={{
          title: 'Drawdown',
          description:
            'Scăderea de la vârf la minim a valorii portofoliului în timp.',
          content: <DrawdownChart data={data.drawdown} />,
        }}
        info={{
          title: 'Drawdown Maxim',
          definition:
            'Cea mai mare scădere de la un vârf la un minim al valorii portofoliului, observată pe perioada analizată.',
          equation:
            'MDD = \\min_t \\left( \\frac{V_t - \\max_{s \\le t} V_s}{\\max_{s \\le t} V_s} \\right)',
          implementation: [
            'Se calculează maximul acumulat al seriei valorii portofoliului',
            'Se măsoară scăderea fiecărui punct față de maximul acumulat',
            'Se raportează cea mai negativă scădere observată',
          ],
        }}
      />
      <KpiCard
        label='Beneficiu de Diversificare'
        value={formatUsd(data.diversification.diversification_benefit)}
        subValue={formatPercent(
          data.diversification.diversification_benefit_pct,
        )}
        chart={{
          title: 'Beneficiu de Diversificare',
          description:
            'VaR individual per poziție, comparativ cu VaR-ul diversificat al portofoliului.',
          content: <DiversificationChart data={data.diversification} />,
        }}
        info={{
          title: 'Beneficiu de Diversificare',
          definition:
            'Reducerea riscului obținută dintr-un portofoliu diversificat, față de suma riscurilor individuale ale pozițiilor, generată de corelația imperfectă dintre poziții.',
          equation: 'DB = \\sum_i VaR_i - VaR_{portfolio}',
          implementation: [
            'Se calculează VaR-ul individual pentru fiecare poziție, izolat',
            'Se calculează VaR-ul portofoliului diversificat, folosind structura completă de covarianță/corelație',
            'Se calculează diferența (și ca procent din suma VaR-urilor individuale)',
          ],
        }}
      />
    </div>
  );
}
