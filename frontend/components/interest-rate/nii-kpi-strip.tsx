import { KpiCard } from '@/components/market/kpi-card';
import type { NIIAnalysisResponse } from '@/lib/definitions';
import { formatRon } from '@/lib/utils';
import { DeltaNiiChart } from './delta-nii-chart';

export interface NiiKpiStripProps {
  data: NIIAnalysisResponse;
}

export function NiiKpiStrip({ data }: NiiKpiStripProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      <KpiCard
        label='NII de bază'
        value={formatRon(data.base.nii_value)}
        subValue={`Fără șoc de rată, orizont ${data.horizon_days} zile`}
        info={{
          title: 'NII de bază',
          definition:
            'Venitul net din dobânzi așteptat pe orizontul de 12 luni, la ratele curente, fără niciun șoc de rată.',
          equation: 'NII = \\sum_{ASSET} \\text{dobândă} - \\sum_{LIABILITY} \\text{dobândă}',
        }}
      />
      <KpiCard
        label={`NII la șoc +${data.shock_bp} bps`}
        value={formatRon(data.shock_up.nii_value)}
        subValue={`ΔNII ${data.shock_up.delta_nii >= 0 ? '+' : ''}${formatRon(data.shock_up.delta_nii)}`}
        status={data.shock_up.delta_nii >= 0 ? 'green' : 'red'}
        chart={{
          title: 'ΔNII pe scenariu',
          description:
            'Impactul asupra NII al unui șoc paralel de rată, în sus și în jos.',
          content: <DeltaNiiChart data={data} />,
        }}
        info={{
          title: 'ΔNII sub șoc de rată',
          definition:
            'Poziții care se refixează în orizontul de 12 luni primesc rata curentă plus șocul, de la data de repricing până la finalul orizontului; poziții care nu se refixează în orizont rămân neschimbate.',
          implementation: [
            'Se recalculează dobânda pentru fiecare poziție cu rata curentă + șoc, aplicată doar după data de repricing',
            'Se însumează pe ASSET și LIABILITY, separat de scenariul de bază',
            'ΔNII = NII(șoc) − NII(bază)',
          ],
        }}
      />
      <KpiCard
        label={`NII la șoc -${data.shock_bp} bps`}
        value={formatRon(data.shock_down.nii_value)}
        subValue={`ΔNII ${data.shock_down.delta_nii >= 0 ? '+' : ''}${formatRon(data.shock_down.delta_nii)}`}
        status={data.shock_down.delta_nii >= 0 ? 'green' : 'red'}
      />
    </div>
  );
}
