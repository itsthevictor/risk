import { KpiCard } from '@/components/market/kpi-card';
import type {
  EveAnalysisResponse,
  EveScenarioResult,
  EveScenarios,
} from '@/lib/definitions';
import { DeltaEveChart } from './delta-eve-chart';
import { EveChart } from './eve-chart';
import { fmt } from '@/lib/i18n/config';
import { useDictionary, useFormatRon } from '@/providers/i18n-provider';

export interface EveKpiStripProps {
  data: EveAnalysisResponse;
}

export function EveKpiStrip({ data }: EveKpiStripProps) {
  const { eve, scenarios } = useDictionary().interestRate;
  const ron = useFormatRon();
  const { base, ...shocks } = data.scenarios;
  const shockEntries = Object.entries(shocks) as [
    Exclude<keyof EveScenarios, 'base'>,
    EveScenarioResult,
  ][];
  const worstScenario = shockEntries.reduce((worst, current) =>
    current[1].eve_value < worst[1].eve_value ? current : worst,
  );

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      <KpiCard
        label={eve.base.label}
        value={ron(base.eve_value)}
        subValue={fmt(eve.base.subValue, {
          assets: ron(base.pv_assets),
          liabilities: ron(base.pv_liabilities),
        })}
        chart={{
          title: eve.base.chartTitle,
          description: eve.base.chartDescription,
          content: <EveChart data={data} />,
        }}
        info={{
          title: eve.base.infoTitle,
          definition: eve.base.definition,
          equation:
            'EVE = \\sum_{ASSET} PV - \\sum_{LIABILITY} PV,\\quad PV = \\frac{\\text{principal}}{(1+r/100)^t}',
        }}
      />
      <KpiCard
        label={eve.worst.label}
        value={scenarios[worstScenario[0]]}
        subValue={`ΔEVE ${ron(worstScenario[1].delta_eve)}`}
        status={worstScenario[1].delta_eve >= 0 ? 'green' : 'red'}
        chart={{
          title: eve.worst.chartTitle,
          description: eve.worst.chartDescription,
          content: <DeltaEveChart data={data} />,
        }}
        info={{
          title: eve.worst.infoTitle,
          definition: eve.worst.definition,
          implementation: eve.worst.steps,
        }}
      />
      <KpiCard
        label={eve.parallel.label}
        value={ron(data.scenarios.parallel_up.delta_eve)}
        subValue={fmt(eve.parallel.subValue, {
          value: ron(data.scenarios.parallel_down.delta_eve),
        })}
        status={data.scenarios.parallel_up.delta_eve >= 0 ? 'green' : 'red'}
      />
    </div>
  );
}
