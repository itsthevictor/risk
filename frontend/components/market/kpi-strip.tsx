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
import { VarHistogramChart } from './var-histogram-chart';
import { VolatilityForecastChart } from './volatility-forecast-chart';
import { worstTrafficLight } from './traffic-light-badge';

const TRAFFIC_LIGHT_VALUE_LABELS: Record<TrafficLight, string> = {
  green: 'VERDE',
  yellow: 'GALBEN',
  red: 'ROȘU',
};

const METHOD_LABELS: Record<keyof MethodBacktest, string> = {
  historical: 'Simulare Istorică',
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
        info={{
          title: `Value at Risk — ${METHOD_LABELS[primaryMethod]}`,
          definition:
            'Pierderea maximă estimată pe un anumit orizont de timp, la nivelul de încredere ales. Expected Shortfall (ES) reprezintă pierderea medie în coada distribuției, dincolo de VaR.',
          equation:
            'VaR_\\alpha = \\inf\\{x \\in \\mathbb{R} : P(L > x) \\le 1 - \\alpha\\}',
          implementation: [
            'Simulare istorică: cuantila empirică a distribuției P&L realizate',
            'Parametric: cuantilă calculată analitic presupunând o distribuție normală (sau Student-t) a randamentelor',
            'EWMA / GARCH: VaR parametric folosind o estimare a volatilității condiționate în locul varianței eșantionului',
            'Monte Carlo: cuantilă estimată din traiectorii simulate ale randamentului portofoliului',
          ],
        }}
        chart={
          headline
            ? {
                title: `Distribuția P&L — ${METHOD_LABELS[primaryMethod]}`,
                description:
                  'Histograma P&L-ului zilnic realizat pe fereastra analizată, cu pragurile de pierdere VaR și ES marcate.',
                content: (
                  <VarHistogramChart
                    pnl={data.actual_pnl}
                    varLevel={headline.var}
                    esLevel={headline.es}
                  />
                ),
              }
            : undefined
        }
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
