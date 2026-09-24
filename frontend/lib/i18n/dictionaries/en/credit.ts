import type credit from '../ro/credit';

const en: typeof credit = {
  title: 'Credit risk — Retail portfolio',
  subtitle: 'PD (logistic regression) · empirical LGD · advanced IRB RWA',
  loanCount: '{count} loans',
  updating: ' · updating…',
  datasetIntro: 'The analysis uses the',
  dataLink: 'Data and methodology',
  kpis: {
    ead: {
      label: 'Total EAD',
      infoTitle: 'EAD (Exposure at Default)',
      definition:
        'Exposure at the time of default, calculated consistently across the whole portfolio from the funded amount of the loan — regardless of its current status.',
      steps: [
        'For defaulted loans, the actual exposure at that point (funded_amnt - total_rec_prncp) is used separately, in the empirical LGD calculation.',
      ],
    },
    el: {
      label: 'Expected Loss (EL)',
      subValue: '{pct} of EAD',
      infoTitle: 'EL (Expected Loss)',
      definition:
        'Annual expected loss, the product of the annualised probability of default, loss severity (LGD) and exposure at default (EAD).',
      equation: 'EL = PD_{annual} \\times LGD \\times EAD',
      steps: [
        'PD annualised via a constant hazard-rate conversion from lifetime PD (logistic regression, AUC 0.706).',
        'LGD calculated empirically from the ratio of recoveries to exposure at default (recoveries - collection_recovery_fee), on the subset of charged-off loans.',
      ],
    },
    rwa: {
      label: 'Total RWA',
      infoTitle: 'RWA (Risk-Weighted Assets)',
      definition:
        'The regulatory capital requirement under the advanced IRB approach for retail exposures, derived from the capital function K (Vasicek single-factor model, PD-dependent correlation R, 99.9% regulatory confidence level).',
      equation: 'RWA = K \\times 12.5 \\times EAD',
      steps: [
        'The capital function K follows the Basel II/III advanced IRB formula for retail exposures (no maturity adjustment).',
        'The resulting capital density (RWA/EAD) increases monotonically from grade A to G, in line with rising PD.',
      ],
    },
    density: {
      label: 'Capital density',
    },
  },
  byGrade: {
    title: 'Risk by credit grade',
    description:
      'PD rises steadily from A to G, while LGD stays roughly constant at around 90%.',
  },
  calibration: {
    title: 'PD model calibration',
    description:
      'Calibrated PD vs. observed default rate, by decile — the dotted line marks perfect calibration (calibrated PD = observed rate).',
    predicted: 'Calibrated PD',
    actual: 'Observed rate',
    decile: 'Decile {n}',
  },
  gradeChart: {
    density: 'Capital density',
    grade: 'Grade {grade}',
    tooltipDensity: 'Density: {value}',
    tooltipPd: 'Average PD: {value}',
    tooltipLoans: '{count} loans · EAD {ead}',
  },
  gradeTable: {
    grade: 'Grade',
    loans: 'Loans',
    avgPd: 'Average PD',
    density: 'Density',
  },
  columns: {
    back: 'Back to results',
    title: 'Source columns — dataset & processing',
    description:
      'All {count} columns in the source file, mapped to how they are actually used in the PD/LGD/EAD pipeline.',
    counts: {
      inclusa: '{n} included',
      indirecta: '{n} indirect',
      ignorata: '{n} ignored',
    },
    status: {
      inclusa: 'Included',
      indirecta: 'Indirect',
      ignorata: 'Ignored',
    },
    headers: {
      nr: 'No.',
      column: 'Column',
      meaning: 'What it represents',
      processing: 'Processing applied',
      status: 'Status',
    },
  },
};

export default en;
