const liquidity = {
  title: 'Indicatorul de acoperire a lichidității (LCR)',
  methodology: {
    title: 'Metodologie LCR',
    definition:
      'Liquidity Coverage Ratio: raportul dintre activele lichide de calitate ridicată (HQLA) și ieșirile nete de numerar estimate pe un orizont de stres de 30 de zile calendaristice. Un LCR ≥ 100% arată că banca deține suficiente active lichide pentru a acoperi ieșirile nete într-un scenariu de criză de o lună.',
    equation:
      'LCR = \\frac{HQLA}{\\text{Iesiri nete}} \\times 100\\%, \\quad \\text{Iesiri nete} = \\text{Iesiri totale} - \\min(\\text{Intrari}, 0{,}75 \\times \\text{Iesiri totale})',
    steps: [
      'HQLA — activele sunt clasificate L1/L2A/L2B în funcție de tipul emitentului și banda de rating, apoi li se aplică un haircut (0% / 15% / 25%).',
      'Plafoane L2 — L2B este plafonat la 15% din (L1 + L2A), iar L2A + L2B combinat este plafonat la 40% din HQLA total, aplicate în această ordine.',
      'Ieșiri — se aplică o rată de run-off pe fiecare categorie de depozit retail, en-gros și extrabilanțier (ex. 5% retail stabil, 100% neoperațional interbancar).',
      'Intrări — se aplică o rată de intrare pe fiecare categorie (ex. 50% rambursări retail/corporate, 100% interbancar), iar totalul este plafonat la 75% din ieșirile totale.',
    ],
  },
  intro:
    'Completează pe rând activele lichide (HQLA) deținute, apoi sursele de finanțare care pot ieși din bancă (depozite retail, en-gros și angajamente extrabilanțiere) și, în final, intrările de numerar așteptate.',
  stepLabels: {
    hqla: 'Active lichide',
    retail: 'Depozite retail',
    wholesale: 'Depozite en-gros',
    'off-balance-sheet': 'Extrabilanțiere',
    inflows: 'Intrări',
    review: 'Rezultat LCR',
  },
  status: {
    below_minimum: {
      label: 'Sub minim',
      meaning: 'Non-conformitate reglementară',
    },
    marginal: {
      label: 'Marginal / buffer redus',
      meaning: 'Conform, dar buffer de siguranță redus',
    },
    comfortable: {
      label: 'Confortabil',
      meaning: 'Conform, cu marjă solidă',
    },
  },
  result: {
    title: 'Rezultat calcul LCR',
    hqlaTotal: 'HQLA total',
    inflowsCapped: 'Intrări plafonate (75%)',
    totalOutflows: 'Ieșiri totale',
    netOutflows: 'Ieșiri nete',
    error: 'Calculul a eșuat. Vă rugăm încercați din nou.',
  },
  actions: {
    startOver: 'Reia de la început',
    back: 'Înapoi',
    next: 'Următorul',
    calculate: 'Calculează',
  },
  amountUnit: 'mil. RON',
  fields: {
    name: 'Denumire',
    description: 'Descriere',
    amount: 'Sumă',
    category: 'Categorie',
    issuerType: 'Tip emitent',
    ratingBand: 'Bandă de rating',
    removeItem: 'Elimină elementul {n}',
    addItem: 'Adaugă element',
  },
  steps: {
    hqla: {
      title: 'Active lichide de calitate ridicată (HQLA)',
      description:
        'Adăugați fiecare activ lichid de calitate ridicată, tipul emitentului și, unde este necesar, banda de rating de credit.',
      empty: 'Niciun activ HQLA adăugat încă. Adăugați unul pentru a începe.',
    },
    retail: {
      title: 'Depozite retail',
      description:
        'Adăugați fiecare depozit retail sau IMM și categoria acestuia.',
      empty:
        'Niciun depozit retail adăugat încă. Adăugați unul pentru a începe.',
    },
    wholesale: {
      title: 'Depozite en-gros',
      description: 'Adăugați fiecare depozit en-gros și categoria acestuia.',
      empty:
        'Niciun depozit en-gros adăugat încă. Adăugați unul pentru a începe.',
    },
    offBalanceSheet: {
      title: 'Elemente extrabilanțiere',
      description:
        'Adăugați fiecare angajament sau facilitate extrabilanțieră și categoria acesteia.',
      empty:
        'Niciun element extrabilanțier adăugat încă. Adăugați unul pentru a începe.',
    },
    inflows: {
      title: 'Intrări de numerar',
      description:
        'Adăugați fiecare intrare contractuală de numerar și categoria acesteia.',
      empty:
        'Nicio intrare de numerar adăugată încă. Adăugați una pentru a începe.',
    },
  },
  ratingBand: {
    notRequired:
      'Banda de rating nu este necesară pentru acest tip de emitent.',
    infoDefinition:
      "În practică, banda de rating se derivă din rating-ul emis de agenții precum S&P, Moody's sau Fitch, mapat conform tabelelor ESMA/EBA. Pentru simplitate, acest formular permite selectarea directă a benzii — logica de mapare rating→CQS este un proces separat de clasificare a activelor, nu face parte din calculul LCR propriu-zis.",
    infoSteps: [
      'Nu este implementată preluarea rating-ului brut de la agențiile de rating și maparea sa automată la Credit Quality Steps (CQS).',
      'Complexitatea suplimentară (surse de rating, reguli de agregare, mapări ESMA/EBA) depășește scopul acestui proiect.',
    ],
  },
  review: {
    title: 'Rezultat LCR',
    description:
      'Mai jos regăsiți tabelele cu datele agregate introduse la pașii anteriori, rezultatul LCR apare într-un card sub aceste tabele.',
    hqlaAssets: 'Active HQLA',
    offBalanceSheetItems: 'Elemente extrabilanțiere',
    itemOne: 'element',
    itemMany: 'elemente',
    noItems: 'Niciun element adăugat.',
    noDescription: '(fără descriere)',
  },
  // Display labels for the enum values used by issuer_type, rating_band and category fields.
  labels: {
    // issuer types
    sovereign_own_country: 'Suveran (țara proprie)',
    central_bank_cash: 'Numerar bancă centrală',
    sovereign_foreign: 'Suveran (străin)',
    multilateral_dev_bank: 'Bancă multilaterală de dezvoltare',
    covered_bond: 'Obligațiune garantată',
    corporate_bond: 'Obligațiune corporativă',
    equity_index_listed: 'Acțiuni (index listat)',
    equity_other: 'Acțiuni (altele)',
    rmbs: 'RMBS',
    other: 'Altele',
    // rating bands
    AAA_AA: 'AAA până la AA-',
    A: 'A+ până la A-',
    BBB: 'BBB+ până la BBB-',
    below_BBB_minus: 'Sub BBB-',
    not_rated: 'Fără rating',
    // retail deposit categories
    stable_retail: 'Retail stabil',
    less_stable_retail: 'Retail mai puțin stabil',
    sme: 'IMM',
    // wholesale deposit categories
    operational_deposit: 'Depozit operațional',
    non_operational_corporate: 'Neoperațional (corporativ)',
    non_operational_financial_institution:
      'Neoperațional (instituție financiară)',
    // off-balance-sheet categories
    retail_sme_facility: 'Facilitate retail / IMM',
    corporate_facility: 'Facilitate corporativă',
    bank_fi_facility: 'Facilitate bancă / instituție financiară',
    // inflow categories
    secured_lending_l1_collateral: 'Împrumut garantat (garanție L1)',
    secured_lending_l2a_collateral: 'Împrumut garantat (garanție L2A)',
    retail_sme_loan_repayment: 'Rambursare împrumut retail / IMM',
    corporate_loan_repayment: 'Rambursare împrumut corporativ',
    bank_fi_loan_repayment: 'Rambursare împrumut bancă / instituție financiară',
  } as Record<string, string>,
};

export default liquidity;
