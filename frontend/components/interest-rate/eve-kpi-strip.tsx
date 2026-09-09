import { KpiCard } from '@/components/market/kpi-card';
import type {
  EveAnalysisResponse,
  EveScenarioResult,
  EveScenarios,
} from '@/lib/definitions';
import { formatRon } from '@/lib/utils';
import { DeltaEveChart } from './delta-eve-chart';
import { EveChart } from './eve-chart';
import { EVE_SCENARIO_LABELS } from './eve-scenarios';

export interface EveKpiStripProps {
  data: EveAnalysisResponse;
}

export function EveKpiStrip({ data }: EveKpiStripProps) {
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
        label='EVE de bază'
        value={formatRon(base.eve_value)}
        subValue={`VP active ${formatRon(base.pv_assets)} · VP pasive ${formatRon(base.pv_liabilities)}`}
        chart={{
          title: 'EVE pe scenariu',
          description:
            'Valoarea economică a capitalului sub fiecare scenariu de șoc al curbei de randament.',
          content: <EveChart data={data} />,
        }}
        info={{
          title: 'EVE de bază',
          definition:
            'Valoarea economică a capitalului: valoarea prezentă a activelor minus valoarea prezentă a pasivelor, actualizate pe curba de randament curentă, fără niciun șoc.',
          equation:
            'EVE = \\sum_{ASSET} PV - \\sum_{LIABILITY} PV,\\quad PV = \\frac{\\text{principal}}{(1+r/100)^t}',
        }}
      />
      <KpiCard
        label='Cel mai advers scenariu'
        value={EVE_SCENARIO_LABELS[worstScenario[0]]}
        subValue={`ΔEVE ${formatRon(worstScenario[1].delta_eve)}`}
        status={worstScenario[1].delta_eve >= 0 ? 'green' : 'red'}
        chart={{
          title: 'ΔEVE pe scenariu',
          description:
            'Impactul asupra EVE al fiecărui scenariu de șoc, față de scenariul de bază.',
          content: <DeltaEveChart data={data} />,
        }}
        info={{
          title: 'Cel mai advers scenariu',
          definition:
            'Scenariul de șoc al curbei de randament (dintre cele 6 standard IRRBB) cu cea mai mare pierdere de valoare economică a capitalului față de scenariul de bază.',
          implementation: [
            'Se recalculează EVE sub fiecare scenariu de șoc (paralel sus/jos, steepener, flattener, short-end sus/jos)',
            'Se calculează ΔEVE = EVE(șoc) − EVE(bază) pentru fiecare',
            'Se raportează scenariul cu cel mai negativ ΔEVE',
          ],
        }}
      />
      <KpiCard
        label='Paralel sus vs. jos'
        value={formatRon(data.scenarios.parallel_up.delta_eve)}
        subValue={`Paralel jos: ${formatRon(data.scenarios.parallel_down.delta_eve)}`}
        status={data.scenarios.parallel_up.delta_eve >= 0 ? 'green' : 'red'}
      />
    </div>
  );
}
