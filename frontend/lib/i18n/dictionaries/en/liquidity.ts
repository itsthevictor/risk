import type liquidity from '../ro/liquidity';

const en: typeof liquidity = {
  title: 'Liquidity Coverage Ratio (LCR)',
  methodology: {
    title: 'LCR methodology',
    definition:
      'Liquidity Coverage Ratio: the ratio of high-quality liquid assets (HQLA) to the net cash outflows expected over a 30-calendar-day stress horizon. An LCR ≥ 100% shows the bank holds enough liquid assets to cover net outflows in a one-month crisis scenario.',
    equation:
      'LCR = \\frac{HQLA}{\\text{Net outflows}} \\times 100\\%, \\quad \\text{Net outflows} = \\text{Total outflows} - \\min(\\text{Inflows}, 0.75 \\times \\text{Total outflows})',
    steps: [
      'HQLA — assets are classified as L1/L2A/L2B based on issuer type and rating band, then a haircut is applied (0% / 15% / 25%).',
      'L2 caps — L2B is capped at 15% of (L1 + L2A), and combined L2A + L2B is capped at 40% of total HQLA, applied in that order.',
      'Outflows — a run-off rate is applied to each retail, wholesale and off-balance-sheet category (e.g. 5% stable retail, 100% non-operational interbank).',
      'Inflows — an inflow rate is applied to each category (e.g. 50% retail/corporate repayments, 100% interbank), and the total is capped at 75% of total outflows.',
    ],
  },
  intro:
    'Fill in the liquid assets (HQLA) held first, then the funding sources that could leave the bank (retail and wholesale deposits, off-balance-sheet commitments) and, finally, the expected cash inflows.',
  stepLabels: {
    hqla: 'Liquid assets',
    retail: 'Retail deposits',
    wholesale: 'Wholesale deposits',
    'off-balance-sheet': 'Off-balance-sheet',
    inflows: 'Inflows',
    review: 'LCR result',
  },
  status: {
    below_minimum: {
      label: 'Below minimum',
      meaning: 'Regulatory non-compliance',
    },
    marginal: {
      label: 'Marginal / thin buffer',
      meaning: 'Compliant, but with a thin safety buffer',
    },
    comfortable: {
      label: 'Comfortable',
      meaning: 'Compliant, with a solid margin',
    },
  },
  result: {
    title: 'LCR calculation result',
    hqlaTotal: 'Total HQLA',
    inflowsCapped: 'Capped inflows (75%)',
    totalOutflows: 'Total outflows',
    netOutflows: 'Net outflows',
    error: 'The calculation failed. Please try again.',
  },
  actions: {
    startOver: 'Start over',
    back: 'Back',
    next: 'Next',
    calculate: 'Calculate',
  },
  amountUnit: 'RON m',
  fields: {
    name: 'Name',
    description: 'Description',
    amount: 'Amount',
    category: 'Category',
    issuerType: 'Issuer type',
    ratingBand: 'Rating band',
    removeItem: 'Remove item {n}',
    addItem: 'Add item',
  },
  steps: {
    hqla: {
      title: 'High-quality liquid assets (HQLA)',
      description:
        'Add each high-quality liquid asset, its issuer type and, where required, its credit rating band.',
      empty: 'No HQLA assets added yet. Add one to get started.',
    },
    retail: {
      title: 'Retail deposits',
      description: 'Add each retail or SME deposit and its category.',
      empty: 'No retail deposits added yet. Add one to get started.',
    },
    wholesale: {
      title: 'Wholesale deposits',
      description: 'Add each wholesale deposit and its category.',
      empty: 'No wholesale deposits added yet. Add one to get started.',
    },
    offBalanceSheet: {
      title: 'Off-balance-sheet items',
      description:
        'Add each off-balance-sheet commitment or facility and its category.',
      empty: 'No off-balance-sheet items added yet. Add one to get started.',
    },
    inflows: {
      title: 'Cash inflows',
      description: 'Add each contractual cash inflow and its category.',
      empty: 'No cash inflows added yet. Add one to get started.',
    },
  },
  ratingBand: {
    notRequired: 'A rating band is not required for this issuer type.',
    infoDefinition:
      "In practice, the rating band is derived from the rating issued by agencies such as S&P, Moody's or Fitch, mapped using the ESMA/EBA tables. For simplicity, this form lets you pick the band directly — the rating→CQS mapping is a separate asset classification process, not part of the LCR calculation itself.",
    infoSteps: [
      "Fetching the raw rating from rating agencies and mapping it automatically to Credit Quality Steps (CQS) isn't implemented.",
      'The extra complexity (rating sources, aggregation rules, ESMA/EBA mappings) is beyond the scope of this project.',
    ],
  },
  review: {
    title: 'LCR result',
    description:
      'The tables below summarise the data entered in the previous steps; the LCR result appears in a card below them.',
    hqlaAssets: 'HQLA assets',
    offBalanceSheetItems: 'Off-balance-sheet items',
    itemOne: 'item',
    itemMany: 'items',
    noItems: 'No items added.',
    noDescription: '(no description)',
  },
  labels: {
    // issuer types
    sovereign_own_country: 'Sovereign (domestic)',
    central_bank_cash: 'Central bank cash',
    sovereign_foreign: 'Sovereign (foreign)',
    multilateral_dev_bank: 'Multilateral development bank',
    covered_bond: 'Covered bond',
    corporate_bond: 'Corporate bond',
    equity_index_listed: 'Equity (listed index)',
    equity_other: 'Equity (other)',
    rmbs: 'RMBS',
    other: 'Other',
    // rating bands
    AAA_AA: 'AAA to AA-',
    A: 'A+ to A-',
    BBB: 'BBB+ to BBB-',
    below_BBB_minus: 'Below BBB-',
    not_rated: 'Not rated',
    // retail deposit categories
    stable_retail: 'Stable retail',
    less_stable_retail: 'Less stable retail',
    sme: 'SME',
    // wholesale deposit categories
    operational_deposit: 'Operational deposit',
    non_operational_corporate: 'Non-operational (corporate)',
    non_operational_financial_institution:
      'Non-operational (financial institution)',
    // off-balance-sheet categories
    retail_sme_facility: 'Retail / SME facility',
    corporate_facility: 'Corporate facility',
    bank_fi_facility: 'Bank / financial institution facility',
    // inflow categories
    secured_lending_l1_collateral: 'Secured lending (L1 collateral)',
    secured_lending_l2a_collateral: 'Secured lending (L2A collateral)',
    retail_sme_loan_repayment: 'Retail / SME loan repayment',
    corporate_loan_repayment: 'Corporate loan repayment',
    bank_fi_loan_repayment: 'Bank / financial institution loan repayment',
  },
};

export default en;
