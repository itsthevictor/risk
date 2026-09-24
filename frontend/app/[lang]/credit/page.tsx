'use client';

import { useEffect, useState } from 'react';
import { KpiCard } from '@/components/market/kpi-card';
import { densityStatus, GradeChart } from '@/components/credit/grade-chart';
import { GradeTable } from '@/components/credit/grade-table';
import { CalibrationChart } from '@/components/credit/calibration-chart';
import { formatPercent, formatUsd } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@tabler/icons-react';
import Link from '@/components/locale-link';
import { fmt } from '@/lib/i18n/config';
import { useDictionary, useIntlLocale } from '@/providers/i18n-provider';
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
  const { credit: t } = useDictionary();
  const intlLocale = useIntlLocale();
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
          <h1 className='text-2xl font-bold'>{t.title}</h1>
          <p className='text-muted-foreground text-sm'>{t.subtitle}</p>
        </div>
        <p className='text-muted-foreground text-sm'>
          {fmt(t.loanCount, {
            count: portfolio.n_loans.toLocaleString(intlLocale),
          })}
          {loading ? t.updating : ''}
        </p>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-2'>
        <p className='text-muted-foreground text-sm'>
          {t.datasetIntro}
          <a
            href='https://www.kaggle.com/datasets/wordsforthewise/lending-club?resource=download'
            className='text-sm text-blue-500 underline ml-2'
            target='_blank'
            rel='noopener noreferrer'
            data-umami-event='credit-kaggle-dataset-link'
          >
            Lending Club 2007 - 2018
          </a>
        </p>
        <Button
          variant='outline'
          className='text-muted-foreground hover:text-foreground'
        >
          <Link
            href='/credit/data'
            className='text-sm  flex items-center gap-2'
            data-umami-event='credit-data-link'
          >
            {t.dataLink} <IconArrowRight />
          </Link>
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <KpiCard
          label={t.kpis.ead.label}
          value={formatUsd(portfolio.ead_total)}
          info={{
            title: t.kpis.ead.infoTitle,
            definition: t.kpis.ead.definition,
            equation: 'EAD = \\text{funded\\_amnt}',
            implementation: t.kpis.ead.steps,
          }}
        />
        <KpiCard
          label={t.kpis.el.label}
          value={formatUsd(portfolio.el_total)}
          subValue={fmt(t.kpis.el.subValue, {
            pct: formatPercent(portfolio.el_pct, 2),
          })}
          info={{
            title: t.kpis.el.infoTitle,
            definition: t.kpis.el.definition,
            equation: t.kpis.el.equation,
            implementation: t.kpis.el.steps,
          }}
        />
        <KpiCard
          label={t.kpis.rwa.label}
          value={formatUsd(portfolio.rwa_total)}
          info={{
            title: t.kpis.rwa.infoTitle,
            definition: t.kpis.rwa.definition,
            equation: t.kpis.rwa.equation,
            implementation: t.kpis.rwa.steps,
          }}
        />
        <KpiCard
          label={t.kpis.density.label}
          value={formatPercent(portfolio.capital_density, 1)}
          subValue='RWA / EAD'
          status={densityStatus(portfolio.capital_density)}
        />
      </div>

      <div className='space-y-3 border-t pt-6'>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold'>{t.byGrade.title}</h2>
          <p className='text-muted-foreground text-sm'>
            {t.byGrade.description}
          </p>
        </div>
        <GradeChart data={by_grade} />
        <GradeTable data={by_grade} />
      </div>

      <div className='space-y-3 border-t pt-6'>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold'>{t.calibration.title}</h2>
          <p className='text-muted-foreground text-sm'>
            {t.calibration.description}
          </p>
        </div>
        <CalibrationChart data={calibration} />
      </div>
    </div>
  );
}
