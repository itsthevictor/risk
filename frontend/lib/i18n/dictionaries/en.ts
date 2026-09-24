import type { Dictionary } from '../dictionaries';
import credit from './en/credit';
import interestRate from './en/interest-rate';
import liquidity from './en/liquidity';
import market from './en/market';

const en: Dictionary = {
  meta: {
    title: 'Risk portfolio - Victor Alexa',
    description:
      'Fundamental risk analysis techniques portfolio. Personal project - Victor A.',
  },
  nav: {
    menu: 'Navigation',
    market: 'Market risk',
    liquidity: 'Liquidity risk',
    interestRate: 'Interest rate risk',
    credit: 'Credit risk',
    about: 'About',
    language: 'Language',
  },
  common: {
    back: 'Back',
    home: 'Home',
    close: 'Close',
    moreInfo: 'More information',
    viewChart: 'View chart',
    implementation: 'Implementation',
    choose: 'Choose',
    chooseDate: 'Choose a date',
    selectDate: 'Select a date',
    selectPlaceholder: 'Select...',
    searchTicker: 'Search ticker...',
    noResults: 'No results.',
    remove: 'Remove {item}',
    calculating: 'Calculating…',
    requestFailed: 'Request failed',
  },
  status: {
    ok: 'OK',
    warning: 'Warning',
    breach: 'Breach',
    critical: 'Critical breach',
  },
  validation: {
    ratingBandRequired: 'A rating band is required for this issuer type',
    minTickers: 'Select at least 2 tickers',
    maxTickers: 'Select at most 10 tickers',
    duplicateTickers: 'Duplicate tickers in portfolio',
  },
  notFound: {
    title: 'Page not found',
    description: "Sorry, the page you're looking for doesn't exist.",
  },
  home: {
    title: 'Risk analysis portfolio',
    disclaimer:
      'A portfolio of risk analysis tools - personal project by Victor Alexa (DOFIN · 2026). Not intended for commercial use.',
    intro:
      'This portfolio contains tools built on the fundamental techniques for analysing market risk, liquidity risk, interest rate risk and credit risk. It was built with Python and Next.js.',
    note: 'Personal portfolio project — not intended for production use, regulatory reporting or informing investment decisions. For more information, see the project on',
    market: {
      badges: ['VaR', 'ES', 'Volatility', 'Backtesting', 'Stress Testing'],
      source: 'Live market data.',
    },
    liquidity: {
      badges: ['HQLA', 'Net outflows', 'LCR'],
      source: 'LCR form',
    },
    interestRate: {
      badges: ['EVE', 'NII', 'Rate shocks'],
      source: 'Mock data',
    },
    credit: {
      badges: ['PD', 'LGD', 'EAD', 'EL', 'RWA'],
      source: 'Lending Club 2007-2018 dataset (Kaggle)',
    },
  },
  market,
  liquidity,
  interestRate,
  credit,
};

export default en;
