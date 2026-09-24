const market = {
  methods: {
    historical: 'Simulare Istorică',
    parametric: 'Parametric',
    parametricSampleStd: 'Parametric (deviație standard eșantion)',
    ewma: 'Parametric (EWMA)',
    garch: 'Parametric (GARCH)',
    monte_carlo: 'Monte Carlo',
  },
  assetClasses: {
    equity: 'Equity',
    bond: 'Obligațiuni',
    commodity: 'Aur / Marfă',
    fx: 'FX',
    crypto: 'Cripto',
  } as Record<string, string>,
  form: {
    tickers: 'Tickere',
    portfolioValue: 'Valoarea portofoliului',
    estimationWindow: 'Fereastra de estimare (zile)',
    submit: 'Analizează',
    submitting: 'Se analizează…',
  },
  page: {
    tickersError:
      'Nu s-a putut încărca lista de tickere — verifică dacă backend-ul rulează',
    analysisError: 'A apărut o eroare la rularea analizei.',
    intro:
      'Pentru a iniția analiza selectează activele, valoarea portofoliului și durata ferestrei de estimare.',
    introNote: 'Pentru simplitate, portofoliul va avea ponderi egale.',
    running: 'Se rulează analiza…',
    runningDetail:
      'Se descarcă istoricul de preț și se calibrează modelele (EWMA, GARCH, Monte Carlo, backtest)…',
    currentRisk: 'Risc curent',
    computedAt: 'Calculat la {date}, pe baza întregului istoric disponibil.',
  },
  backtest: {
    title: 'Backtest complet',
    info: 'Click pe o metodă din tabel (sau pe iconița grafic din dreptul ei) pentru a actualiza graficul depășirilor de mai jos.',
    description:
      'Kupiec, Christoffersen și lumina de semafor pentru fiecare metodă, calculate pe tot istoricul disponibil ({count} observații).',
    method: 'Metodă',
    breaches: 'Depășiri',
    trafficLight: 'Semafor',
  },
  stress: {
    title: 'Stress Testing',
    descriptionBefore: 'Impactul asupra portofoliului de',
    today: 'azi',
    descriptionAfter:
      '— nu cum s-a comportat modelul de VaR, ci ce s-ar întâmpla cu valoarea curentă dacă s-ar repeta un scenariu de criză.',
    show: 'Arată',
    hide: 'Ascunde',
    scenario: 'Scenariu',
    scenarios: {
      '2020': '2020 — COVID-19',
      '2022': '2022 — Rate-hike sell-off',
      custom: 'Personalizat',
    },
    replayWindows: {
      '2020': 'COVID-19 (19 feb – 20 mar 2020)',
      '2022': 'Rate-hike sell-off (27 dec 2021 – 14 oct 2022)',
    },
    presetShocks: 'Scădere presupusă per clasă de active:',
    historicalError: 'A apărut o eroare la calculul replay-ului istoric.',
    hypotheticalError: 'A apărut o eroare la calculul scenariului.',
    historicalReplay: 'Replay istoric',
    appliedScenario: 'Scenariu aplicat',
    appliedScenarioDescription:
      'Șoc pe clase de active, ponderat cu compoziția portofoliului',
    customShocks: 'Șocuri per clasă de active',
    recalculate: 'Recalculează',
    endingValue: 'Valoare finală',
    annualizedVolatility: 'Volatilitate anualizată',
  },
  varTable: {
    noData: 'Nu există date pentru nivelul de încredere {level}.',
    method: 'Metodă',
    distributionTitle: 'Distribuția P&L — {method}',
    distributionDescription:
      'Histograma P&L-ului zilnic realizat, cu pragurile de pierdere VaR și ES marcate.',
    days: 'Zile',
  },
  charts: {
    pnl: 'P&L realizat',
    varThreshold: 'Prag VaR (zilnic)',
    pnlBreach: 'P&L (depășire VaR)',
    methodCaption: 'VaR și depășiri: metoda {method}',
    drawdown: 'Scădere',
    drawdownMax: 'Maxim {value}',
    portfolio: 'Portofoliu',
  },
  kpis: {
    ewma: {
      label: 'Volatilitate (EWMA)',
      infoTitle: 'Prognoza Volatilității (EWMA)',
      definition:
        'Volatilitatea estimată a portofoliului printr-o medie ponderată exponențial a randamentelor pătratice trecute, care acordă greutate mai mare șocurilor recente.',
      steps: [
        'Se inițializează varianța cu deviația standard pe fereastra de seed (252 zile)',
        'Se actualizează recursiv varianța cu factorul de decădere λ = 0.94',
        'Se exprimă ca procent (rădăcina varianței)',
      ],
    },
    garch: {
      label: 'Volatilitate (GARCH)',
      infoTitle: 'Prognoza Volatilității (GARCH)',
      definition:
        'Volatilitatea condiționată estimată a portofoliului pentru perioada următoare, care permite șocurilor recente să crească sau să reducă riscul față de media pe termen lung.',
      steps: [
        'Se calibrează un model GARCH(1,1) pe seria istorică de randamente',
        'Se estimează varianța condiționată pentru perioada următoare din parametrii calibrați',
        'Se anualizează și se exprimă ca procent',
      ],
    },
    volatilityChart: {
      title: 'Prognoza Volatilității',
      description: 'Volatilitatea condiționată EWMA vs. GARCH în timp.',
    },
    drawdown: {
      label: 'Drawdown Maxim',
      chartTitle: 'Drawdown',
      chartDescription:
        'Scăderea de la vârf la minim a valorii portofoliului în timp.',
      infoTitle: 'Drawdown Maxim',
      definition:
        'Cea mai mare scădere de la un vârf la un minim al valorii portofoliului, observată pe perioada analizată.',
      steps: [
        'Se calculează maximul acumulat al seriei valorii portofoliului',
        'Se măsoară scăderea fiecărui punct față de maximul acumulat',
        'Se raportează cea mai negativă scădere observată',
      ],
    },
    diversification: {
      label: 'Beneficiu de Diversificare',
      chartTitle: 'Beneficiu de Diversificare',
      chartDescription:
        'VaR individual per poziție, comparativ cu VaR-ul diversificat al portofoliului.',
      infoTitle: 'Beneficiu de Diversificare',
      definition:
        'Reducerea riscului obținută dintr-un portofoliu diversificat, față de suma riscurilor individuale ale pozițiilor, generată de corelația imperfectă dintre poziții.',
      steps: [
        'Se calculează VaR-ul individual pentru fiecare poziție, izolat',
        'Se calculează VaR-ul portofoliului diversificat, folosind structura completă de covarianță/corelație',
        'Se calculează diferența (și ca procent din suma VaR-urilor individuale)',
      ],
    },
  },
};

export default market;
