import type { Locale } from '@/lib/i18n/config';

// CV text per language. Layout lives in page.tsx; Romanian is the source shape.
const ro = {
  location: 'Bucharest, România',
  nav: {
    about: 'Profil',
    portfolio: 'Portofoliu risc',
    experience: 'Experiență',
    education: 'Educație',
    skills: 'Competențe',
  },
  hero: {
    badge: 'Banking · Risk Management · Quantitative Analysis',
    title:
      'Construiesc produse și analize bazate pe date, cu accent pe managementul riscului financiar.',
    intro:
      'Profesionist cu peste 10 ani de experiență în strategie, analiză, management de produs și dezvoltare de aplicații. Formarea mea academică în Finanțe, Asigurări, Bănci și Burse de Valori, combinată cu experiența în data analysis, reporting și automatizarea proceselor, stă la baza tranziției mele către Risk Management bancar.',
    portfolioButton: 'Vezi portofoliul de risc',
    contactButton: 'Contact',
    downloadButton: 'Descarcă CV-ul',
  },
  portfolio: {
    eyebrow: 'PROIECT PORTOFOLIU',
    title: 'Analiză de risc bancar',
    description:
      'Portofoliu tehnic construit în Python și Next.js, orientat spre aplicarea practică a conceptelor de risk management.',
    projects: [
      {
        href: '/market',
        title: 'Risc de piață',
        description:
          'Analiza riscului de piață folosind date live și metode cantitative de măsurare și validare.',
        metrics: [
          'VaR',
          'Expected Shortfall',
          'Volatilitate',
          'Backtesting',
          'Stress Testing',
        ],
        source: 'Date live din piață',
      },
      {
        href: '/liquidity',
        title: 'Risc de lichiditate',
        description:
          'Evaluarea poziției de lichiditate și calcularea indicatorilor utilizați pentru monitorizarea riscului.',
        metrics: ['LCR', 'HQLA', 'Ieșiri nete de numerar'],
        source: 'Formular tip wizard',
      },
      {
        href: '/interest-rate',
        title: 'Risc de dobândă',
        description:
          'Analiza sensibilității bilanțului la modificarea ratelor de dobândă și evaluarea impactului asupra valorii economice și venitului net din dobânzi.',
        metrics: ['EVE', 'NII', 'Șocuri de dobândă'],
        source: 'Date de simulare',
      },
      {
        href: '/credit',
        title: 'Risc de credit',
        description:
          'Modelarea riscului de credit pe baza unui set de date de împrumuturi și estimarea parametrilor principali ai pierderii de credit.',
        metrics: ['PD', 'LGD', 'EAD', 'EL', 'RWA'],
        source: 'Lending Club 2007–2018 · Kaggle',
      },
    ],
  },
  focus: [
    {
      title: 'Data & Analytics',
      description:
        'Lucru cu date financiare, modele statistice, indicatori de risc, reporting și dashboard-uri.',
    },
    {
      title: 'Risk Analysis',
      description:
        'Market Risk, Liquidity Risk, Interest Rate Risk și Credit Risk, cu accent pe măsurare, modelare și interpretarea rezultatelor.',
    },
    {
      title: 'Engineering',
      description:
        'Transformarea analizelor în instrumente interactive și reproductibile folosind Python, SQL și tehnologii web moderne.',
    },
  ],
  experienceTitle: 'Experiență profesională',
  experience: [
    {
      period: '2021 — prezent',
      role: 'Fondator · Product Manager · Web Developer',
      company: 'ONCA Digital Works',
      description:
        'Construiesc produse digitale și aplicații web de la cap la coadă: pornesc de la problema reală, gândesc fluxurile, apoi dezvolt, lansez și continui să le îmbunătățesc.',
      highlights: [
        'Am proiectat și dezvoltat aplicații web, platforme interne și instrumente de automatizare pentru companii din România.',
        'Am lucrat cu baze de date SQL și NoSQL, API-uri, integrări externe și procese de automatizare.',
        'Am transformat cerințe operaționale și de business în produse și instrumente software utilizabile.',
        'Am gestionat simultan prioritizarea produsului, arhitectura soluției, dezvoltarea și relația cu stakeholderii.',
      ],
      skills: [
        'Product Management',
        'Data & Analytics',
        'Web Development',
        'Automation',
        'SQL',
        'APIs',
      ],
    },
    {
      period: '2022',
      role: 'Product Manager',
      company: 'Imobiliare.ro',
      description:
        'Product Management în zona B2B, cu accent pe analiză de performanță, optimizarea proceselor comerciale și colaborarea dintre business, sales și dezvoltare web.',
      highlights: [
        'Am lucrat la îmbunătățirea performanței ofertei B2B, urmărind engagement-ul, costul de achiziție și valoarea clienților.',
        'Am contribuit la definirea OKR-urilor pentru migrarea tehnologică la nivelul companiei.',
        'Am colaborat cu echipele de Sales și Technology pentru definirea rapoartelor și workflow-urilor CRM.',
        'Am folosit date operaționale și indicatori de performanță pentru prioritizarea inițiativelor de produs.',
      ],
      skills: [
        'Data-driven Decisions',
        'Product Development',
        'Analytics',
        'OKRs',
        'CRM',
        'Cross-functional Collaboration',
      ],
    },
    {
      period: '2014 — 2021',
      role: 'COO · Commercial Director',
      company: 'Seneca Anticafe & Publishing',
      description:
        'Responsabilitate transversală asupra strategiei comerciale, bugetării, planificării și operațiunilor, într-o organizație aflată în dezvoltare.',
      highlights: [
        'Am fost implicat în proiect încă din etapa inițială și am contribuit la dezvoltarea strategiei, bugetului și structurii operaționale.',
        'Am coordonat planificarea și monitorizarea operațiunilor, urmărind indicatorii de performanță și îmbunătățirea proceselor.',
        'Am dezvoltat și ajustat strategia comercială atât pentru Anticafe, cât și pentru editură.',
        'Am construit și implementat aplicații web de tip CRM/ERP și instrumente interne pentru companii din România, inclusiv proiecte din zona de consultanță și finanțare.',
        'Am lucrat la automatizarea proceselor, integrări API, procesare de documente și integrarea procesatorilor de plăți.',
      ],
      skills: [
        'Financial Planning',
        'Budgeting',
        'Operations',
        'Reporting',
        'Process Improvement',
        'Business Strategy',
      ],
    },
    {
      period: '2012 — 2014',
      role: 'Account Manager · Sales Team Leader',
      company: 'Humanitas',
      description:
        'Management operațional și comercial, cu responsabilitate asupra vânzărilor corporate, performanței echipei și raportării.',
      highlights: [
        'Am gestionat operațiunile și vânzările corporate pentru unul dintre cele mai importante magazine din rețea.',
        'Am construit un dashboard de vânzări în Excel pentru monitorizarea performanței la nivel de magazin.',
        'După depășirea țintei de vânzări pentru prima dată în patru ani, sistemul de raportare a fost adoptat în toate locațiile.',
        'Am automatizat în Google Sheets raportarea KPI-urilor și urmărirea performanței pe funnel și pe fiecare membru al echipei.',
        'Am negociat și obținut un contract multianual pentru un spațiu expozițional exclusiv în Ateneul Român.',
      ],
      skills: [
        'Financial Analysis',
        'Reporting',
        'Excel',
        'Google Sheets',
        'KPIs',
        'Negotiation',
        'Team Management',
      ],
    },
  ],
  educationTitle: 'Educație',
  education: [
    {
      period: '2026 — Prezent',
      title: 'Master - DOFIN (Doctoral School of Finance)',
      institution: 'Academia de Studii Economice din București',
    },
    {
      period: '2023 — 2026',
      title: 'Finanțe, Asigurări, Bănci și Burse de Valori',
      institution: 'Academia de Studii Economice din București',
    },
    {
      period: '2006 — 2009',
      title: 'Litere · Română și Engleză',
      institution: 'Universitatea din București',
    },
  ],
  certificationsTitle: 'Cursuri & certificări',
  certifications: [
    'Bayesian Statistics — From Theory to Practice · Columbia University / Coursera',
    'Agent de Servicii de Investiții financiare · ASF România',
    'Performance Management',
    'Gemba Kaizen — Organizational Management',
    'Fundamentals of Digital Marketing · Google',
  ],
  stackTitle: 'Stack tehnic',
  footerTagline: 'Risk Management Portfolio',
};

export type CvContent = typeof ro;

const en: CvContent = {
  location: 'Bucharest, Romania',
  nav: {
    about: 'Profile',
    portfolio: 'Risk portfolio',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
  },
  hero: {
    badge: 'Banking · Risk Management · Quantitative Analysis',
    title:
      'I build data-driven products and analyses, with a focus on financial risk management.',
    intro:
      'Professional with over 10 years of experience in strategy, analysis, product management and application development. My academic background in Finance, Insurance, Banking and Stock Exchanges, combined with hands-on experience in data analysis, reporting and process automation, underpins my move into banking Risk Management.',
    portfolioButton: 'View the risk portfolio',
    contactButton: 'Contact',
    downloadButton: 'Download CV',
  },
  portfolio: {
    eyebrow: 'PORTFOLIO PROJECT',
    title: 'Banking risk analysis',
    description:
      'A technical portfolio built with Python and Next.js, focused on the practical application of risk management concepts.',
    projects: [
      {
        href: '/market',
        title: 'Market risk',
        description:
          'Market risk analysis using live data and quantitative measurement and validation methods.',
        metrics: [
          'VaR',
          'Expected Shortfall',
          'Volatility',
          'Backtesting',
          'Stress Testing',
        ],
        source: 'Live market data',
      },
      {
        href: '/liquidity',
        title: 'Liquidity risk',
        description:
          'Assessment of the liquidity position and calculation of the metrics used to monitor liquidity risk.',
        metrics: ['LCR', 'HQLA', 'Net cash outflows'],
        source: 'Step-by-step wizard form',
      },
      {
        href: '/interest-rate',
        title: 'Interest rate risk',
        description:
          'Analysis of balance sheet sensitivity to interest rate changes and of the impact on economic value and net interest income.',
        metrics: ['EVE', 'NII', 'Rate shocks'],
        source: 'Simulated data',
      },
      {
        href: '/credit',
        title: 'Credit risk',
        description:
          'Credit risk modelling on a loan dataset and estimation of the main credit loss parameters.',
        metrics: ['PD', 'LGD', 'EAD', 'EL', 'RWA'],
        source: 'Lending Club 2007–2018 · Kaggle',
      },
    ],
  },
  focus: [
    {
      title: 'Data & Analytics',
      description:
        'Working with financial data, statistical models, risk metrics, reporting and dashboards.',
    },
    {
      title: 'Risk Analysis',
      description:
        'Market Risk, Liquidity Risk, Interest Rate Risk and Credit Risk, with a focus on measurement, modelling and interpreting results.',
    },
    {
      title: 'Engineering',
      description:
        'Turning analyses into interactive, reproducible tools using Python, SQL and modern web technologies.',
    },
  ],
  experienceTitle: 'Professional experience',
  experience: [
    {
      period: '2021 — present',
      role: 'Founder · Product Manager · Web Developer',
      company: 'ONCA Digital Works',
      description:
        'I build digital products and web applications end to end: starting from the real problem, designing the flows, then developing, launching and continuously improving them.',
      highlights: [
        'Designed and developed web applications, internal platforms and automation tools for companies in Romania.',
        'Worked with SQL and NoSQL databases, APIs, third-party integrations and automation processes.',
        'Turned operational and business requirements into usable software products and tools.',
        'Handled product prioritisation, solution architecture, development and stakeholder relationships at the same time.',
      ],
      skills: [
        'Product Management',
        'Data & Analytics',
        'Web Development',
        'Automation',
        'SQL',
        'APIs',
      ],
    },
    {
      period: '2022',
      role: 'Product Manager',
      company: 'Imobiliare.ro',
      description:
        'B2B Product Management, focused on performance analysis, optimising sales processes and collaboration between business, sales and web development.',
      highlights: [
        'Worked on improving the performance of the B2B offering, tracking engagement, acquisition cost and customer value.',
        'Helped define the OKRs for the company-wide technology migration.',
        'Worked with the Sales and Technology teams to define CRM reports and workflows.',
        'Used operational data and performance metrics to prioritise product initiatives.',
      ],
      skills: [
        'Data-driven Decisions',
        'Product Development',
        'Analytics',
        'OKRs',
        'CRM',
        'Cross-functional Collaboration',
      ],
    },
    {
      period: '2014 — 2021',
      role: 'COO · Commercial Director',
      company: 'Seneca Anticafe & Publishing',
      description:
        'Cross-functional responsibility for commercial strategy, budgeting, planning and operations in a growing organisation.',
      highlights: [
        'Involved in the project from the early stage; contributed to developing the strategy, budget and operating structure.',
        'Coordinated operational planning and monitoring, tracking performance indicators and process improvement.',
        'Developed and adjusted the commercial strategy for both the Anticafe and the publishing house.',
        'Built and deployed CRM/ERP web applications and internal tools for companies in Romania, including projects in consulting and funding.',
        'Worked on process automation, API integrations, document processing and payment processor integration.',
      ],
      skills: [
        'Financial Planning',
        'Budgeting',
        'Operations',
        'Reporting',
        'Process Improvement',
        'Business Strategy',
      ],
    },
    {
      period: '2012 — 2014',
      role: 'Account Manager · Sales Team Leader',
      company: 'Humanitas',
      description:
        'Operational and commercial management, responsible for corporate sales, team performance and reporting.',
      highlights: [
        'Managed operations and corporate sales for one of the most important stores in the network.',
        'Built an Excel sales dashboard to monitor store-level performance.',
        'After the sales target was exceeded for the first time in four years, the reporting system was adopted across all locations.',
        'Automated KPI reporting and funnel and per-team-member performance tracking in Google Sheets.',
        'Negotiated and secured a multi-year contract for an exclusive exhibition space in the Romanian Athenaeum.',
      ],
      skills: [
        'Financial Analysis',
        'Reporting',
        'Excel',
        'Google Sheets',
        'KPIs',
        'Negotiation',
        'Team Management',
      ],
    },
  ],
  educationTitle: 'Education',
  education: [
    {
      period: '2026 — Present',
      title: "Master's degree - DOFIN (Doctoral School of Finance)",
      institution: 'Bucharest University of Economic Studies',
    },
    {
      period: '2023 — 2026',
      title: 'Finance, Insurance, Banking and Stock Exchanges',
      institution: 'Bucharest University of Economic Studies',
    },
    {
      period: '2006 — 2009',
      title: 'Letters · Romanian and English',
      institution: 'University of Bucharest',
    },
  ],
  certificationsTitle: 'Courses & certifications',
  certifications: [
    'Bayesian Statistics — From Theory to Practice · Columbia University / Coursera',
    'Financial Investment Services Agent · ASF (Romanian Financial Supervisory Authority)',
    'Performance Management',
    'Gemba Kaizen — Organizational Management',
    'Fundamentals of Digital Marketing · Google',
  ],
  stackTitle: 'Tech stack',
  footerTagline: 'Risk Management Portfolio',
};

export const cvContent: Record<Locale, CvContent> = { ro, en };
