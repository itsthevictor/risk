import type {
  MarketRiskAnalyzeResponse,
  MethodBacktest,
  TrafficLight,
} from '@/lib/definitions';
import { formatPercent, formatUsd } from '@/lib/utils';
import { BacktestChart } from './backtest-chart';
import { DiversificationChart } from './diversification-chart';
import { DrawdownChart } from './drawdown-chart';
import { KpiCard } from './kpi-card';
import { VolatilityForecastChart } from './volatility-forecast-chart';
import { worstTrafficLight } from './traffic-light-badge';

const TRAFFIC_LIGHT_VALUE_LABELS: Record<TrafficLight, string> = {
  green: 'VERDE',
  yellow: 'GALBEN',
  red: 'ROȘU',
};

export interface MarketRiskKpiStripProps {
  data: MarketRiskAnalyzeResponse;
  confidenceLevel: number;
}

export function MarketRiskKpiStrip({
  data,
  confidenceLevel,
}: MarketRiskKpiStripProps) {
  const latestGarchVol =
    data.volatility_forecast.garch[data.volatility_forecast.garch.length - 1];

  const methodKeys = Object.keys(data.backtest) as (keyof MethodBacktest)[];
  const worstStatus = worstTrafficLight(
    methodKeys.map((method) => data.backtest[method].traffic_light),
  );

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
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
      <KpiCard
        label='Stare Backtest'
        value={TRAFFIC_LIGHT_VALUE_LABELS[worstStatus]}
        status={worstStatus}
        chart={{
          title: 'Backtest — Depășiri pe Metodă',
          description:
            'Depășirile VaR observate față de numărul estimat la nivelul de încredere ales, colorate după statusul traffic-light.',
          content: (
            <BacktestChart
              data={data.backtest}
              confidenceLevel={confidenceLevel}
            />
          ),
        }}
        info={{
          title: 'Stare Backtest',
          definition:
            'O evaluare de tip traffic-light a acurateței modelului de VaR, bazată pe frecvența cu care pierderile realizate au depășit VaR-ul estimat, comparativ cu numărul așteptat la nivelul de încredere ales (conform cadrului traffic-light Basel).',
          implementation: [
            'Se contorizează depășirile VaR (zilele în care pierderea realizată depășește VaR-ul estimat) pentru fiecare metodă',
            'Se compară numărul de depășiri cu numărul așteptat pentru nivelul de încredere și dimensiunea eșantionului',
            'Se clasifică fiecare metodă ca verde / galben / roșu și se raportează cea mai severă stare dintre metode',
          ],
        }}
      />
    </div>
  );
}
