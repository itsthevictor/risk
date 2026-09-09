'use client';

import { useEffect, useState } from 'react';
import { KpiCard } from '@/components/market/kpi-card';
import { densityStatus, GradeChart } from '@/components/credit/grade-chart';
import { GradeTable } from '@/components/credit/grade-table';
import { CalibrationChart } from '@/components/credit/calibration-chart';
import { formatPercent, formatUsd } from '@/lib/utils';

interface PortfolioSummary {
  n_loans: number;
  ead_total: number;
  el_total: number;
  el_pct: number;
  rwa_total: number;
  capital_density: number;
}

interface GradeRow {
  grade: string;
  n_credite: number;
  PD_mediu: number;
  LGD_grade: number;
  EAD_total: number;
  RWA_total: number;
  densitate_capital: number;
}

interface CalibrationPoint {
  decile: number;
  pd_predicted: number;
  default_actual: number;
}

interface CreditRiskSummary {
  portfolio: PortfolioSummary;
  by_grade: GradeRow[];
  calibration: CalibrationPoint[];
}

const MOCK_RESPONSE: CreditRiskSummary = {
  portfolio: {
    n_loans: 141946,
    ead_total: 733541901,
    el_total: 43442802,
    el_pct: 0.0592,
    rwa_total: 1037773755,
    capital_density: 1.415,
  },
  by_grade: [
    {
      grade: 'A',
      n_credite: 26974,
      PD_mediu: 0.033,
      LGD_grade: 0.9055,
      EAD_total: 122876084,
      RWA_total: 153093563,
      densitate_capital: 1.2459,
    },
    {
      grade: 'B',
      n_credite: 41651,
      PD_mediu: 0.0548,
      LGD_grade: 0.9095,
      EAD_total: 180333801,
      RWA_total: 245507834,
      densitate_capital: 1.3614,
    },
    {
      grade: 'C',
      n_credite: 40878,
      PD_mediu: 0.0743,
      LGD_grade: 0.9084,
      EAD_total: 218539185,
      RWA_total: 314913427,
      densitate_capital: 1.441,
    },
    {
      grade: 'D',
      n_credite: 20354,
      PD_mediu: 0.0885,
      LGD_grade: 0.905,
      EAD_total: 123948991,
      RWA_total: 186132001,
      densitate_capital: 1.5017,
    },
    {
      grade: 'E',
      n_credite: 8660,
      PD_mediu: 0.0989,
      LGD_grade: 0.9073,
      EAD_total: 58769728,
      RWA_total: 91171938,
      densitate_capital: 1.5513,
    },
    {
      grade: 'F',
      n_credite: 2661,
      PD_mediu: 0.1128,
      LGD_grade: 0.9042,
      EAD_total: 21415401,
      RWA_total: 34523387,
      densitate_capital: 1.6121,
    },
    {
      grade: 'G',
      n_credite: 768,
      PD_mediu: 0.1218,
      LGD_grade: 0.9049,
      EAD_total: 7658712,
      RWA_total: 12538795,
      densitate_capital: 1.6372,
    },
  ],
  // PD calibration by decile: predicted vs. observed default rate
  calibration: [
    { decile: 1, pd_predicted: 0.021, default_actual: 0.018 },
    { decile: 2, pd_predicted: 0.034, default_actual: 0.031 },
    { decile: 3, pd_predicted: 0.045, default_actual: 0.049 },
    { decile: 4, pd_predicted: 0.057, default_actual: 0.052 },
    { decile: 5, pd_predicted: 0.068, default_actual: 0.074 },
    { decile: 6, pd_predicted: 0.079, default_actual: 0.071 },
    { decile: 7, pd_predicted: 0.091, default_actual: 0.098 },
    { decile: 8, pd_predicted: 0.104, default_actual: 0.096 },
    { decile: 9, pd_predicted: 0.122, default_actual: 0.131 },
    { decile: 10, pd_predicted: 0.156, default_actual: 0.149 },
  ],
};

export default function CreditRiskPage() {
  const [data] = useState<CreditRiskSummary>(MOCK_RESPONSE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const { portfolio, by_grade, calibration } = data;

  return (
    <div className='space-y-6 p-6 max-w-6xl mx-auto'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold'>
            Risc de credit — Portofoliu retail
          </h1>
          <p className='text-muted-foreground text-sm'>
            PD (regresie logistică) · LGD empiric · RWA IRB avansat
          </p>
        </div>
        <p className='text-muted-foreground text-sm'>
          {portfolio.n_loans.toLocaleString('ro-RO')} credite
          {loading ? ' · se actualizează…' : ''}
        </p>
      </div>

      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div className='space-y-1'>
          <h1 className='text-xl font-bold'>Date și metodologie</h1>
        </div>
        <p className='text-muted-foreground text-sm'>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat
          impedit vel nesciunt quos! Inventore aliquid facilis laboriosam
          reprehenderit! Suscipit reiciendis nam cum ipsum.
        </p>
      </div>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <KpiCard label='EAD total' value={formatUsd(portfolio.ead_total)} />
        <KpiCard
          label='Pierdere așteptată (EL)'
          value={formatUsd(portfolio.el_total)}
          subValue={`${formatPercent(portfolio.el_pct, 2)} din EAD`}
        />
        <KpiCard label='RWA total' value={formatUsd(portfolio.rwa_total)} />
        <KpiCard
          label='Densitate capital'
          value={formatPercent(portfolio.capital_density, 1)}
          subValue='RWA / EAD'
          status={densityStatus(portfolio.capital_density)}
        />
      </div>

      <div className='space-y-3 border-t pt-6'>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold'>Risc pe grad de credit</h2>
          <p className='text-muted-foreground text-sm'>
            PD crește progresiv de la A la G, în timp ce LGD rămâne relativ
            constant, în jur de 90%.
          </p>
        </div>
        <GradeChart data={by_grade} />
        <GradeTable data={by_grade} />
      </div>

      <div className='space-y-3 border-t pt-6'>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold'>Calibrare model PD</h2>
          <p className='text-muted-foreground text-sm'>
            PD calibrat vs. rata de default observată, pe decile — linia
            punctată marchează calibrarea perfectă (PD calibrat = rată
            observată).
          </p>
        </div>
        <CalibrationChart data={calibration} />
      </div>
    </div>
  );
}
