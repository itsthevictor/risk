import credit from './ro/credit';
import interestRate from './ro/interest-rate';
import liquidity from './ro/liquidity';
import market from './ro/market';

const ro = {
  meta: {
    title: 'Portofoliu risc - Victor Alexa',
    description:
      'Portofoliu de tehnici fundamentale de analiză de risc. Proiect personal - Victor A.',
  },
  nav: {
    menu: 'Navigare',
    market: 'Risc de piață',
    liquidity: 'Risc de lichiditate',
    interestRate: 'Risc de dobândă',
    credit: 'Risc de credit',
    about: 'Despre',
    language: 'Limba',
  },
  common: {
    back: 'Înapoi',
    home: 'Pagina principală',
    close: 'Închide',
    moreInfo: 'Mai multe informații',
    viewChart: 'Vezi grafic',
    implementation: 'Implementare',
    choose: 'Alege',
    chooseDate: 'Alege data',
    selectDate: 'Selectați o dată',
    selectPlaceholder: 'Selectează...',
    searchTicker: 'Caută ticker...',
    noResults: 'Niciun rezultat.',
    remove: 'Elimină {item}',
    calculating: 'Se calculează…',
    requestFailed: 'Cerere eșuată',
  },
  status: {
    ok: 'OK',
    warning: 'Avertisment',
    breach: 'Depășire',
    critical: 'Depășire critică',
  },
  validation: {
    ratingBandRequired:
      'Banda de rating este obligatorie pentru acest tip de emitent',
    minTickers: 'Selectează cel puțin 2 tickere',
    maxTickers: 'Selectează cel mult 10 tickere',
    duplicateTickers: 'Tickere duplicate în portofoliu',
  } as Record<string, string>,
  notFound: {
    title: 'Pagina nu a fost găsită',
    description: 'Ne pare rău, dar pagina pe care o căutați nu există.',
  },
  home: {
    title: 'Portofoliu analiză de risc',
    disclaimer:
      'Portofoliu de instrumente de analiză de risc - Proiect personal Victor Alexa, (DOFIN · 2026). Produs nedestinat pentru uz comercial.',
    intro:
      'Acest portofoliu cuprinde instrumente bazate pe tehnicile fundamentale de analiză a riscului de piață, riscului de lichiditate, riscului de dobândă și riscului de credit și a fost construit folosind Python și Next.js.',
    note: 'Proiect de portofoliu personal — nedestinat producției, raportării reglementare sau informării deciziilor de investiții. Pentru mai multe informații, vă rugăm să vizitați proiectul pe',
    market: {
      badges: ['VaR', 'ES', 'Volatilitate', 'Backtesting', 'Stress Testing'],
      source: 'Date live din piață.',
    },
    liquidity: {
      badges: ['HQLA', 'Ieșiri nete', 'LCR'],
      source: 'Formular LCR',
    },
    interestRate: {
      badges: ['EVE', 'NII', 'Șocuri de dobândă'],
      source: 'Date mockup',
    },
    credit: {
      badges: ['PD', 'LGD', 'EAD', 'EL', 'RWA'],
      source: 'Dataset Lending Club 2007-2018 (Kaggle)',
    },
  },
  market,
  liquidity,
  interestRate,
  credit,
};

export default ro;
