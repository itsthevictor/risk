const interestRate = {
  title: 'Risc de dobândă — IRRBB',
  subtitle:
    'Interest Rate Risk in the Banking Book — Net Interest Income (NII) și sensibilitatea acestuia la un șoc paralel de rată.',
  dataLink: 'Date și metodologie →',
  niiComputedAt: 'Calculat la {date}, orizont de {days} zile.',
  eveComputedAt:
    'Calculat la {date}, pe baza curbei de randament curente și a 6 scenarii de șoc standard IRRBB.',
  shockSize: 'Mărime șoc',
  niiError: 'A apărut o eroare la calculul NII.',
  eveError: 'A apărut o eroare la calculul EVE.',
  data: {
    back: '← Risc de dobândă — IRRBB',
    title: 'Date și metodologie',
    description:
      'Încât scopul portofoliului este acela de a exemplifica implementarea corectă a algoritmilor de calcul IRRBB, am generat și folosit 100 de rânduri de poziții fictive (mockaroo). În prepararea datelor am asigurat coerența între datele de repricing și maturitate pentru fiecare categorie de poziții, cât și între diferitele categorii de poziții.',
    loading: 'Se încarcă…',
    error: 'A apărut o eroare la încărcarea datelor.',
    columns: {
      position_id: 'ID',
      position_type: 'Tip',
      category: 'Categorie',
      principal: 'Principal',
      current_rate: 'Rată curentă',
      repricing_date: 'Data repricing',
      maturity_date: 'Data maturitate',
    },
  },
  scenarios: {
    base: 'Bază',
    parallel_up: 'Paralel sus (+200bps)',
    parallel_down: 'Paralel jos (-200bps)',
    steepener: 'Steepener',
    flattener: 'Flattener',
    short_up: 'Short-end sus',
    short_down: 'Short-end jos',
  },
  table: {
    scenario: 'Scenariu',
    niiBase: 'Bază (fără șoc)',
    niiShock: 'Șoc {shock} bps',
    interestIncome: 'Venit din dobânzi',
    interestExpense: 'Cheltuială cu dobânzi',
    pvAssets: 'VP Active',
    pvLiabilities: 'VP Pasive',
  },
  nii: {
    base: {
      label: 'NII de bază',
      subValue: 'Fără șoc de rată, orizont {days} zile',
      infoTitle: 'NII de bază',
      definition:
        'Venitul net din dobânzi așteptat pe orizontul de 12 luni, la ratele curente, fără niciun șoc de rată.',
      equation:
        'NII = \\sum_{ASSET} \\text{dobândă} - \\sum_{LIABILITY} \\text{dobândă}',
    },
    shockLabel: 'NII la șoc {shock} bps',
    chartTitle: 'ΔNII pe scenariu',
    chartDescription:
      'Impactul asupra NII al unui șoc paralel de rată, în sus și în jos.',
    delta: {
      infoTitle: 'ΔNII sub șoc de rată',
      definition:
        'Poziții care se refixează în orizontul de 12 luni primesc rata curentă plus șocul, de la data de repricing până la finalul orizontului; poziții care nu se refixează în orizont rămân neschimbate.',
      steps: [
        'Se recalculează dobânda pentru fiecare poziție cu rata curentă + șoc, aplicată doar după data de repricing',
        'Se însumează pe ASSET și LIABILITY, separat de scenariul de bază',
        'ΔNII = NII(șoc) − NII(bază)',
      ],
    },
  },
  eve: {
    base: {
      label: 'EVE de bază',
      subValue: 'VP active {assets} · VP pasive {liabilities}',
      chartTitle: 'EVE pe scenariu',
      chartDescription:
        'Valoarea economică a capitalului sub fiecare scenariu de șoc al curbei de randament.',
      infoTitle: 'EVE de bază',
      definition:
        'Valoarea economică a capitalului: valoarea prezentă a activelor minus valoarea prezentă a pasivelor, actualizate pe curba de randament curentă, fără niciun șoc.',
    },
    worst: {
      label: 'Cel mai advers scenariu',
      chartTitle: 'ΔEVE pe scenariu',
      chartDescription:
        'Impactul asupra EVE al fiecărui scenariu de șoc, față de scenariul de bază.',
      infoTitle: 'Cel mai advers scenariu',
      definition:
        'Scenariul de șoc al curbei de randament (dintre cele 6 standard IRRBB) cu cea mai mare pierdere de valoare economică a capitalului față de scenariul de bază.',
      steps: [
        'Se recalculează EVE sub fiecare scenariu de șoc (paralel sus/jos, steepener, flattener, short-end sus/jos)',
        'Se calculează ΔEVE = EVE(șoc) − EVE(bază) pentru fiecare',
        'Se raportează scenariul cu cel mai negativ ΔEVE',
      ],
    },
    parallel: {
      label: 'Paralel sus vs. jos',
      subValue: 'Paralel jos: {value}',
    },
  },
};

export default interestRate;
