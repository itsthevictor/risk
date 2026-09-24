const credit = {
  title: 'Risc de credit — Portofoliu retail',
  subtitle: 'PD (regresie logistică) · LGD empiric · RWA IRB avansat',
  loanCount: '{count} credite',
  updating: ' · se actualizează…',
  datasetIntro: 'Analiza utilizează setul de date',
  dataLink: 'Date și metodologie',
  kpis: {
    ead: {
      label: 'EAD total',
      infoTitle: 'EAD (Exposure at Default)',
      definition:
        'Expunerea la momentul default-ului, calculată consecvent pe tot portofoliul din valoarea finanțată a creditului — indiferent de statusul curent al acestuia.',
      steps: [
        'Pentru creditele intrate în default, expunerea reală la momentul respectiv (funded_amnt - total_rec_prncp) e folosită separat, la calculul LGD empiric.',
      ],
    },
    el: {
      label: 'Pierdere așteptată (EL)',
      subValue: '{pct} din EAD',
      infoTitle: 'EL (Expected Loss)',
      definition:
        'Pierderea așteptată anuală, rezultată din produsul dintre probabilitatea de default anualizată, severitatea pierderii (LGD) și expunerea la default (EAD).',
      equation: 'EL = PD_{anual} \\times LGD \\times EAD',
      steps: [
        'PD anualizat printr-o conversie hazard-rate constant din PD lifetime (regresie logistică, AUC 0,706).',
        'LGD calculat empiric din raportul recuperări/expunere la default (recoveries - collection_recovery_fee), pe subsetul creditelor charged-off.',
      ],
    },
    rwa: {
      label: 'RWA total',
      infoTitle: 'RWA (Risk-Weighted Assets)',
      definition:
        'Cerința de capital reglementar sub abordarea IRB avansată pentru expuneri retail, derivată din funcția de capital K (model Vasicek single-factor, corelație R dependentă de PD, percentila de încredere reglementară 99,9%).',
      equation: 'RWA = K \\times 12{,}5 \\times EAD',
      steps: [
        'Funcția de capital K urmează formula IRB avansată Basel II/III pentru expuneri retail (fără maturity adjustment).',
        'Densitatea de capital rezultată (RWA/EAD) crește monoton de la gradul A la G, în linie cu creșterea PD.',
      ],
    },
    density: {
      label: 'Densitate capital',
    },
  },
  byGrade: {
    title: 'Risc pe grad de credit',
    description:
      'PD crește progresiv de la A la G, în timp ce LGD rămâne relativ constant, în jur de 90%.',
  },
  calibration: {
    title: 'Calibrare model PD',
    description:
      'PD calibrat vs. rata de default observată, pe decile — linia punctată marchează calibrarea perfectă (PD calibrat = rată observată).',
    predicted: 'PD calibrat',
    actual: 'Rată reală',
    decile: 'Decila {n}',
  },
  gradeChart: {
    density: 'Densitate capital',
    grade: 'Grad {grade}',
    tooltipDensity: 'Densitate: {value}',
    tooltipPd: 'PD mediu: {value}',
    tooltipLoans: '{count} credite · EAD {ead}',
  },
  gradeTable: {
    grade: 'Grad',
    loans: 'Credite',
    avgPd: 'PD mediu',
    density: 'Densitate',
  },
  columns: {
    back: 'Înapoi la rezultate',
    title: 'Coloane sursă — set de date & procesare',
    description:
      'Toate cele {count} coloane ale fișierului sursă, mapate la utilizarea lor efectivă în pipeline-ul PD/LGD/EAD.',
    counts: {
      inclusa: '{n} incluse',
      indirecta: '{n} indirecte',
      ignorata: '{n} ignorate',
    },
    status: {
      inclusa: 'Inclusă',
      indirecta: 'Indirectă',
      ignorata: 'Ignorată',
    },
    headers: {
      nr: 'Nr.',
      column: 'Coloană',
      meaning: 'Ce reprezintă',
      processing: 'Procesare aplicată',
      status: 'Status',
    },
  },
};

export default credit;
