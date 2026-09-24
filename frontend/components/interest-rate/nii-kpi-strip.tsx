import { KpiCard } from '@/components/market/kpi-card';
import type { NIIAnalysisResponse } from '@/lib/definitions';
import { DeltaNiiChart } from './delta-nii-chart';
import { fmt } from '@/lib/i18n/config';
import { useDictionary, useFormatRon } from '@/providers/i18n-provider';

export interface NiiKpiStripProps {
  data: NIIAnalysisResponse;
}

export function NiiKpiStrip({ data }: NiiKpiStripProps) {
  const { nii } = useDictionary().interestRate;
  const ron = useFormatRon();
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      <KpiCard
        label={nii.base.label}
        value={ron(data.base.nii_value)}
        subValue={fmt(nii.base.subValue, { days: data.horizon_days })}
        info={{
          title: nii.base.infoTitle,
          definition: nii.base.definition,
          equation: nii.base.equation,
        }}
      />
      <KpiCard
        label={fmt(nii.shockLabel, { shock: `+${data.shock_bp}` })}
        value={ron(data.shock_up.nii_value)}
        subValue={`ΔNII ${data.shock_up.delta_nii >= 0 ? '+' : ''}${ron(data.shock_up.delta_nii)}`}
        status={data.shock_up.delta_nii >= 0 ? 'green' : 'red'}
        chart={{
          title: nii.chartTitle,
          description: nii.chartDescription,
          content: <DeltaNiiChart data={data} />,
        }}
        info={{
          title: nii.delta.infoTitle,
          definition: nii.delta.definition,
          implementation: nii.delta.steps,
        }}
      />
      <KpiCard
        label={fmt(nii.shockLabel, { shock: `-${data.shock_bp}` })}
        value={ron(data.shock_down.nii_value)}
        subValue={`ΔNII ${data.shock_down.delta_nii >= 0 ? '+' : ''}${ron(data.shock_down.delta_nii)}`}
        status={data.shock_down.delta_nii >= 0 ? 'green' : 'red'}
      />
    </div>
  );
}
