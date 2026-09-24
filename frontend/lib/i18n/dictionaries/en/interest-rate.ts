import type interestRate from '../ro/interest-rate';

const en: typeof interestRate = {
  title: 'Interest rate risk — IRRBB',
  subtitle:
    'Interest Rate Risk in the Banking Book — Net Interest Income (NII) and its sensitivity to a parallel rate shock.',
  dataLink: 'Data and methodology →',
  niiComputedAt: 'Calculated as of {date}, {days}-day horizon.',
  eveComputedAt:
    'Calculated as of {date}, using the current yield curve and the 6 standard IRRBB shock scenarios.',
  shockSize: 'Shock size',
  niiError: 'Something went wrong while calculating NII.',
  eveError: 'Something went wrong while calculating EVE.',
  data: {
    back: '← Interest rate risk — IRRBB',
    title: 'Data and methodology',
    description:
      'Since the aim of the portfolio is to demonstrate a correct implementation of the IRRBB calculation algorithms, I generated and used 100 rows of fictitious positions (mockaroo). When preparing the data, I made sure the repricing and maturity dates are consistent within each position category, as well as across categories.',
    loading: 'Loading…',
    error: 'Something went wrong while loading the data.',
    columns: {
      position_id: 'ID',
      position_type: 'Type',
      category: 'Category',
      principal: 'Principal',
      current_rate: 'Current rate',
      repricing_date: 'Repricing date',
      maturity_date: 'Maturity date',
    },
  },
  scenarios: {
    base: 'Base',
    parallel_up: 'Parallel up (+200bps)',
    parallel_down: 'Parallel down (-200bps)',
    steepener: 'Steepener',
    flattener: 'Flattener',
    short_up: 'Short-end up',
    short_down: 'Short-end down',
  },
  table: {
    scenario: 'Scenario',
    niiBase: 'Base (no shock)',
    niiShock: '{shock} bps shock',
    interestIncome: 'Interest income',
    interestExpense: 'Interest expense',
    pvAssets: 'PV assets',
    pvLiabilities: 'PV liabilities',
  },
  nii: {
    base: {
      label: 'Base NII',
      subValue: 'No rate shock, {days}-day horizon',
      infoTitle: 'Base NII',
      definition:
        'Expected net interest income over the 12-month horizon at current rates, with no rate shock.',
      equation:
        'NII = \\sum_{ASSET} \\text{interest} - \\sum_{LIABILITY} \\text{interest}',
    },
    shockLabel: 'NII under {shock} bps shock',
    chartTitle: 'ΔNII by scenario',
    chartDescription:
      'The impact on NII of a parallel rate shock, up and down.',
    delta: {
      infoTitle: 'ΔNII under a rate shock',
      definition:
        'Positions that reprice within the 12-month horizon get the current rate plus the shock, from the repricing date to the end of the horizon; positions that do not reprice within the horizon are unchanged.',
      steps: [
        'Recalculate the interest for each position at the current rate + shock, applied only after the repricing date',
        'Sum across ASSET and LIABILITY, separately from the base scenario',
        'ΔNII = NII(shock) − NII(base)',
      ],
    },
  },
  eve: {
    base: {
      label: 'Base EVE',
      subValue: 'PV assets {assets} · PV liabilities {liabilities}',
      chartTitle: 'EVE by scenario',
      chartDescription:
        'The economic value of equity under each yield curve shock scenario.',
      infoTitle: 'Base EVE',
      definition:
        'The economic value of equity: the present value of assets minus the present value of liabilities, discounted on the current yield curve, with no shock.',
    },
    worst: {
      label: 'Most adverse scenario',
      chartTitle: 'ΔEVE by scenario',
      chartDescription:
        'The impact on EVE of each shock scenario, relative to the base scenario.',
      infoTitle: 'Most adverse scenario',
      definition:
        'The yield curve shock scenario (out of the 6 standard IRRBB scenarios) with the largest loss of economic value of equity relative to the base scenario.',
      steps: [
        'Recalculate EVE under each shock scenario (parallel up/down, steepener, flattener, short-end up/down)',
        'Calculate ΔEVE = EVE(shock) − EVE(base) for each',
        'Report the scenario with the most negative ΔEVE',
      ],
    },
    parallel: {
      label: 'Parallel up vs. down',
      subValue: 'Parallel down: {value}',
    },
  },
};

export default en;
