import type market from '../ro/market';

const en: typeof market = {
  methods: {
    historical: 'Historical Simulation',
    parametric: 'Parametric',
    parametricSampleStd: 'Parametric (sample standard deviation)',
    ewma: 'Parametric (EWMA)',
    garch: 'Parametric (GARCH)',
    monte_carlo: 'Monte Carlo',
  },
  assetClasses: {
    equity: 'Equity',
    bond: 'Bonds',
    commodity: 'Gold / Commodities',
    fx: 'FX',
    crypto: 'Crypto',
  },
  form: {
    tickers: 'Tickers',
    portfolioValue: 'Portfolio value',
    estimationWindow: 'Estimation window (days)',
    submit: 'Analyse',
    submitting: 'Analysing…',
  },
  page: {
    tickersError:
      "Couldn't load the ticker list — check that the backend is running",
    analysisError: 'Something went wrong while running the analysis.',
    intro:
      'To start the analysis, select the assets, the portfolio value and the length of the estimation window.',
    introNote: 'For simplicity, the portfolio is equally weighted.',
    running: 'Running the analysis…',
    runningDetail:
      'Downloading price history and calibrating the models (EWMA, GARCH, Monte Carlo, backtest)…',
    currentRisk: 'Current risk',
    computedAt: 'Calculated as of {date}, using the full available history.',
  },
  backtest: {
    title: 'Full backtest',
    info: 'Click a method in the table (or the chart icon next to it) to update the breach chart below.',
    description:
      'Kupiec, Christoffersen and the traffic light for each method, calculated over the full available history ({count} observations).',
    method: 'Method',
    breaches: 'Breaches',
    trafficLight: 'Traffic light',
  },
  stress: {
    title: 'Stress Testing',
    descriptionBefore: 'The impact on',
    today: "today's",
    descriptionAfter:
      'portfolio — not how the VaR model performed, but what would happen to the current value if a crisis scenario repeated itself.',
    show: 'Show',
    hide: 'Hide',
    scenario: 'Scenario',
    scenarios: {
      '2020': '2020 — COVID-19',
      '2022': '2022 — Rate-hike sell-off',
      custom: 'Custom',
    },
    replayWindows: {
      '2020': 'COVID-19 (19 Feb – 20 Mar 2020)',
      '2022': 'Rate-hike sell-off (27 Dec 2021 – 14 Oct 2022)',
    },
    presetShocks: 'Assumed decline per asset class:',
    historicalError:
      'Something went wrong while calculating the historical replay.',
    hypotheticalError: 'Something went wrong while calculating the scenario.',
    historicalReplay: 'Historical replay',
    appliedScenario: 'Applied scenario',
    appliedScenarioDescription:
      'Asset-class shock, weighted by portfolio composition',
    customShocks: 'Shocks per asset class',
    recalculate: 'Recalculate',
    endingValue: 'Ending value',
    annualizedVolatility: 'Annualised volatility',
  },
  varTable: {
    noData: 'No data for the {level} confidence level.',
    method: 'Method',
    distributionTitle: 'P&L distribution — {method}',
    distributionDescription:
      'Histogram of realised daily P&L, with the VaR and ES loss thresholds marked.',
    days: 'Days',
  },
  charts: {
    pnl: 'Realised P&L',
    varThreshold: 'VaR threshold (daily)',
    pnlBreach: 'P&L (VaR breach)',
    methodCaption: 'VaR and breaches: {method} method',
    drawdown: 'Drawdown',
    drawdownMax: 'Max {value}',
    portfolio: 'Portfolio',
  },
  kpis: {
    ewma: {
      label: 'Volatility (EWMA)',
      infoTitle: 'Volatility Forecast (EWMA)',
      definition:
        'Portfolio volatility estimated as an exponentially weighted average of past squared returns, giving more weight to recent shocks.',
      steps: [
        'Initialise the variance with the standard deviation over the seed window (252 days)',
        'Update the variance recursively with decay factor λ = 0.94',
        'Express as a percentage (square root of the variance)',
      ],
    },
    garch: {
      label: 'Volatility (GARCH)',
      infoTitle: 'Volatility Forecast (GARCH)',
      definition:
        'Estimated conditional portfolio volatility for the next period, letting recent shocks raise or lower risk relative to the long-run average.',
      steps: [
        'Calibrate a GARCH(1,1) model on the historical return series',
        'Estimate the conditional variance for the next period from the calibrated parameters',
        'Annualise and express as a percentage',
      ],
    },
    volatilityChart: {
      title: 'Volatility Forecast',
      description: 'EWMA vs. GARCH conditional volatility over time.',
    },
    drawdown: {
      label: 'Maximum Drawdown',
      chartTitle: 'Drawdown',
      chartDescription: 'Peak-to-trough decline in portfolio value over time.',
      infoTitle: 'Maximum Drawdown',
      definition:
        'The largest peak-to-trough decline in portfolio value observed over the analysed period.',
      steps: [
        'Compute the running maximum of the portfolio value series',
        'Measure how far each point is below the running maximum',
        'Report the most negative decline observed',
      ],
    },
    diversification: {
      label: 'Diversification Benefit',
      chartTitle: 'Diversification Benefit',
      chartDescription:
        'Standalone VaR per position, compared with the diversified portfolio VaR.',
      infoTitle: 'Diversification Benefit',
      definition:
        'The risk reduction achieved by a diversified portfolio compared with the sum of the individual position risks, driven by imperfect correlation between positions.',
      steps: [
        'Compute the standalone VaR for each position in isolation',
        'Compute the diversified portfolio VaR using the full covariance/correlation structure',
        'Compute the difference (also as a percentage of the sum of standalone VaRs)',
      ],
    },
  },
};

export default en;
