# Portofoliu instrumente analiză de risc - proiect personal

#### Tehnologii utilizate

**Backend** — FastAPI + Pydantic (API și validare), SQLModel/SQLAlchemy peste
Postgres (cache de prețuri), `yfinance` (sursă de date de piață), `numpy` /
`pandas` (calcul numeric), `scipy` (distribuții statistice) și `arch` (calibrare
GARCH).

**Frontend** — Next.js + React + TypeScript, React Hook Form + Zod (formulare și
validare), TanStack Query (fetching/cache pe client), Recharts (grafice),
componente shadcn/ui pe bază de Radix/Base UI + Tailwind CSS.

## 1. Risc de Piață (Market Risk)

Modul de analiză a riscului de piață pentru un portofoliu de active (acțiuni, ETF-uri
etc.), cu VaR/ES calculat prin 5 metode diferite, backtesting istoric al fiecărei
metode, și stress testing pe scenarii de criză (două scenarii istorice si opțiune de scenariu discret personalizat).

### Modele de calcul VaR/ES

| Metodă                  | Logică                                                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Simulare Istorică**   | Percentila empirică a randamentelor efective din fereastra de estimare — nicio presupunere de distribuție.                                                                                         |
| **Parametric (Normal)** | `VaR = portfolio_value · σ · z_cf`, cu `σ` = deviația standard eșantion a randamentelor din fereastră (varianță-covarianță).                                                                       |
| **EWMA**                | Volatilitate cu decădere exponențială: `σ²_t = λ·σ²_{t-1} + (1-λ)·r²_{t-1}`, `λ = 0.94`, inițializată cu deviația standard pe primele 252 de zile.                                                 |
| **GARCH(1,1)**          | Volatilitate condiționată calibrată cu pachetul `arch` (`vol="Garch"`, `dist="normal"`, `mean="Zero"`); dacă modelul nu converge, cererea eșuează explicit în loc să întoarcă un rezultat nesigur. |
| **Monte Carlo**         | 10.000 de simulări `N(μ, σ)` pe zi (`μ`, `σ` din aceeași fereastră ca la metoda parametrică), cu `seed` fix (42) ca rezultatul să fie reproductibil între cereri identice.                         |

Expected Shortfall (ES) se calculează, pentru fiecare metodă, ca media pierderilor
care depășesc VaR-ul (istoric) sau prin formula închisă a cozii normale
`ES = σ · φ(z_cf) / (1 - cf)` (parametric/EWMA/GARCH), respectiv media simulărilor
sub prag (Monte Carlo).

### Alegeri practice de metodologie

- **Istoric de 15 ani** descărcat prin `yfinance` și cache-uit în Postgres (fetch
  incremental — se cer de la Yahoo doar zilele lipsă, nu tot intervalul de fiecare
  dată). Acest istoric lung e folosit **doar** pentru backtesting, drawdown și
  corelații — nu pentru cifra de VaR/ES afișată.
- **Fereastra de estimare e liberă** (`estimation_window_days`, 30–756 zile,
  implicit 252) — cifra de VaR/ES "curentă" se calculează exclusiv din ultimele
  N zile de randamente, nu din tot istoricul. E o alegere deliberată: aplicația
  răspunde la "cât de mare e riscul _acum_, dat fiind regimul de volatilitate
  recent", nu "care a fost cea mai gravă coadă din tot istoricul disponibil".
- **Orizont de 1 zi**, fără scalare `√t` la un holding period mai lung — practica
  standard în risk management de piață, care evită autocorelația introdusă de
  randamente cumulate pe ferestre suprapuse.
- **Ziua curentă e exclusă** din fereastra de estimare (out-of-sample: se
  estimează riscul zilei `t` doar din randamentele strict anterioare lui `t`,
  fără să "vadă" rezultatul zilei respective) și din fetch-ul de preț (sesiunea
  de azi poate fi încă în desfășurare / nepublicată la Yahoo).
- **Ponderi egale** pe toate activele selectate (2–10 tickere).

### Backtesting

Pentru fiecare metodă, se rulează un backtest rulant pe tot istoricul disponibil
(nu doar pe fereastra curentă): pentru fiecare zi din trecut, se recalculează ce
ar fi spus metoda folosind doar datele de dinainte, apoi se compară cu pierderea
efectivă realizată. Din asta rezultă:

- **Testul Kupiec** (unconditional coverage) — verifică dacă _numărul_ de
  depășiri ale VaR se potrivește cu ce ar aștepta nivelul de încredere ales.
- **Testul Christoffersen** (independence) — verifică dacă depășirile sunt
  _grupate_ în timp (clustering, semn de model prost calibrat) sau independente.
- **Conditional Coverage** — combinația celor două de mai sus (`LR_cc = LR_uc + LR_ind`).
- **Semafor stil Basel** (verde/galben/roșu) — pe fereastra ultimelor 250 de zile,
  compară numărul de depășiri cu pragurile binomiale (generalizate la orice nivel
  de încredere ales, nu fixate la pragurile oficiale 4/9 de la 99%).

### Alte metrici (independente de metoda VaR)

- **Drawdown maxim** — cea mai mare scădere vârf-minim a valorii portofoliului,
  calculată o singură dată pe tot istoricul, din randamentele efective realizate.
- **Beneficiu de diversificare** — diferența dintre suma VaR-urilor individuale
  (per activ, izolat) și VaR-ul parametric al portofoliului combinat; folosește
  tot istoricul de 15 ani, nu fereastra de estimare.
- **Matrice de corelație** — corelația randamentelor zilnice între toate activele
  selectate, pe tot istoricul.

### Stress Testing

Independent de analiza de mai sus (nu refolosește fitul GARCH/backtest-ul):

- **Replay istoric** — aplică randamentele reale dintr-o fereastră acută de criză
  (COVID 19 feb–20 mar 2020, rate-hike sell-off 27 dec 2021–14 oct 2022, sau un
  interval personalizat) peste portofoliul curent.
- **Scenariu ipotetic** — șocuri procentuale editabile per clasă de active
  (equity/bond/commodity), fără să necesite date de piață.

Secțiunea e afișată deschisă implicit (nu necesită click), cu scenariul 2020
rulat automat imediat ce analiza principală se termină.

### Cum sunt afișate rezultatele (UI)

- **Carduri KPI** — Volatilitate EWMA, Volatilitate GARCH, Drawdown Maxim,
  Beneficiu de Diversificare; fiecare cu grafic și explicație (formulă +
  pași de implementare) în drawer-ul de info.
- **Tabel comparativ VaR/ES** — toate cele 5 metode, pe cele 3 niveluri de
  încredere (90/95/99%), în dolari și procent din valoarea portofoliului.
- **Tabel scorecard backtest** — statusul traffic-light și statisticile
  Kupiec/Christoffersen/CC per metodă, cu selecție interactivă a metodei
  active pentru graficul de mai jos.
- **Grafic PnL vs. VaR** — P&L zilnic realizat suprapus peste seria de VaR
  a metodei selectate, cu zilele de depășire (breach) marcate.
- **Carduri de rezultat stress test** — impact în dolari/procent față de
  valoarea curentă a portofoliului, separat pentru replay istoric și
  scenariul ipotetic.

## 2. Risc de Lichiditate — LCR

Modul de calcul al Liquidity Coverage Ratio (LCR): raportul dintre activele
lichide de calitate ridicată (HQLA) și ieșirile nete de numerar estimate pe
un orizont de stres de 30 de zile calendaristice. Datele de intrare sunt
introduse manual, printr-un formular de tip wizard cu 6 pași (HQLA, depozite
retail, depozite en-gros, angajamente extrabilanțiere, intrări, rezultat).

```
LCR = HQLA / Ieșiri nete × 100%
Ieșiri nete = Ieșiri totale − min(Intrări, 75% × Ieșiri totale)
```

### Clasificarea HQLA

Fiecare activ este clasificat pe niveluri (L1/L2A/L2B/ineligibil) în funcție
de tipul emitentului și, unde e cazul, de banda de rating — de exemplu
suveranul propriu și numerarul la banca centrală sunt L1 necondiționat, o
obligațiune corporativă AAA-AA e L2A, iar una A/BBB e L2B. Maparea completă
issuer_type × rating_band → nivel e configurabilă în
`backend/engines/liquidity_risk/config/lcr_params.json`, nu hardcodată în
motorul de calcul.

Pe fiecare nivel se aplică un haircut asupra valorii activului:

| Nivel | Haircut |
| ----- | ------- |
| L1    | 0%      |
| L2A   | 15%     |
| L2B   | 25%     |

După haircut, se aplică plafoanele reglementare, în ordine:

1. **Plafon L2B** — L2B este limitat la 15% din (L1 + L2A).
2. **Plafon L2 combinat** — L2A + L2B (după plafonul de mai sus) este limitat
   la 40% din HQLA total; dacă e depășit, L2B e redus primul, iar dacă tot nu
   ajunge, se reduce și L2A.

### Ieșiri și intrări de numerar

Pentru depozitele retail, en-gros și angajamentele extrabilanțiere se aplică
o rată de run-off pe categorie (ex. 5% retail stabil, 10% retail mai puțin
stabil/IMM, 25% depozit operațional, 40% neoperațional corporativ, 100%
neoperațional interbancar). Intrările (rambursări de împrumuturi, lending
garantat) au propriile rate pe categorie (0–100%, în funcție de tipul
colateralului/contrapărții) și sunt plafonate global la 75% din ieșirile
totale — o bancă nu se poate baza pe intrări pentru a-și acoperi integral
ieșirile de stres. Toate ratele sunt configurabile în același fișier
`lcr_params.json`.

### Cum sunt afișate rezultatele (UI)

- **Formular wizard** — datele se introduc pas cu pas (HQLA → retail →
  en-gros → extrabilanțier → intrări), cu validare la navigare între pași și
  salvare automată a draft-ului în `sessionStorage`, ca să nu se piardă la
  refresh accidental.

- **Card de rezultat** — Recapitulează toate elementele introduse și afișează LCR-ul calculat, cu un status vizual (sub minim /
  marginal / confortabil, în funcție de prag: <100%, 100–120%, ≥120%) și
  detalierea HQLA total, intrări plafonate, ieșiri totale și ieșiri nete.

## 3. Risc de Dobândă — IRRBB (NII & EVE)

Modul de Interest Rate Risk in the Banking Book: măsoară sensibilitatea
băncii la variații ale ratelor de dobândă din două perspective complementare
— NII (impact pe termen scurt asupra profitabilității) și EVE (impact pe
termen lung asupra valorii economice a capitalului). Spre deosebire de
Market Risk și LCR, datele de intrare nu sunt introduse manual — portofoliul
este generat sintetic (100 de poziții mock), cu profiluri de repricing și
maturitate regenerate per categorie (cash aproape overnight, depozite la
termen pe termen mediu, obligațiuni guvernamentale și credite variabile pe
termen lung etc.), reproductibil (`seed` fix), ca să reflecte un profil de
scadență realist în ciuda datelor sursă (mockaroo) incoerente.

### NII (Net Interest Income)

Venitul net din dobânzi așteptat pe un orizont de 12 luni, sub un șoc
paralel de rată (implicit ±200 bps, configurabil din UI):

```
NII = Σ dobândă (ASSET) − Σ dobândă (LIABILITY)
```

Pentru fiecare poziție: dacă data de repricing cade după finalul
orizontului, dobânda se calculează la rata curentă pe tot orizontul.
Altfel, pro-rata — la rata curentă până la repricing, apoi la (rata curentă
± șoc) de la repricing până la finalul orizontului. ΔNII se calculează față
de scenariul de bază (fără șoc), separat pentru șocul în sus și în jos.

### EVE (Economic Value of Equity)

Valoarea economică a capitalului: valoarea prezentă a activelor minus
valoarea prezentă a pasivelor, actualizate pe curba de randament până la
data de maturitate a fiecărei poziții:

```
EVE = Σ PV (ASSET) − Σ PV (LIABILITY),   PV = principal / (1 + r/100)^t
```

Se calculează sub cele 6 scenarii standard de șoc IRRBB, plus scenariul de
bază — curba de randament e interpolată liniar pe ancore de maturitate
(0–20 ani), fără extrapolare (plată în afara domeniului):

| Scenariu      | Șoc aplicat                                                             |
| ------------- | ----------------------------------------------------------------------- |
| Paralel sus   | +200 bps pe toată curba                                                 |
| Paralel jos   | -200 bps pe toată curba                                                 |
| Steepener     | -100 bps la capătul scurt, +150 bps la capătul lung (interpolat liniar) |
| Flattener     | curbă de randament alternativă, mai plată, predefinită                  |
| Short-end sus | +250 bps la capătul scurt, descrescător exponențial spre capătul lung   |
| Short-end jos | -250 bps la capătul scurt, descrescător exponențial spre capătul lung   |

ΔEVE se calculează față de scenariul de bază pentru fiecare din cele 6
scenarii de șoc.

### Cum sunt afișate rezultatele (UI)

- **Tab-uri NII / EVE** — cele două perspective sunt afișate separat, fiecare
  cu propriul set de carduri KPI și tabel de scenarii.
- **Carduri KPI NII** — NII de bază, NII la șoc +bps și -bps, cu ΔNII și
  grafic comparativ pe scenarii; mărimea șocului e selectabilă din UI
  (100/200/300 bps).
- **Tabel scenarii NII** — venit din dobânzi, cheltuială cu dobânzi, NII și
  ΔNII, pentru bază și cele două șocuri.
- **Carduri KPI EVE** — EVE de bază (cu grafic pe toate cele 7 scenarii),
  cel mai advers scenariu (cu ΔEVE și grafic comparativ), și paralel sus vs.
  jos.
- **Tabel scenarii EVE** — valoare prezentă active/pasive, EVE și ΔEVE,
  pentru toate cele 7 scenarii (bază + 6 șocuri).
- **Pagină "Date și metodologie"** — tabelul complet al celor 100 de poziții
  sintetice (tip, categorie, principal, rată curentă, date de repricing/
  maturitate), sortabil pe orice coloană.

## 4. Risc de Credit

Spre deosebire de celelalte module, analiza de risc de credit nu rulează
live — a fost făcută offline, pe un set de date real (nu sintetic), iar
rezultatele sunt afișate ca atare în UI. Nu are sens recalculul la fiecare
request: calibrarea modelului PD durează, iar datele sursă (Lending Club)
nu se schimbă.

**Scop** — Estimarea pierderii așteptate (Expected Loss) și a cerinței de
capital reglementar (Risk-Weighted Assets) pentru un portofoliu de credite
de consum, folosind cadrul standard PD–LGD–EAD din Basel II/III (abordarea
IRB). Decizia de risc pe care o susține: câtă capitalizare trebuie alocată
per segment de portofoliu, și ce grade de risc concentrează disproporționat
expunerea la pierdere neașteptată — informație direct utilizabilă în
stabilirea limitelor de subscriere sau în pricing pe grad.

**Date** — Portofoliu de 141.946 credite de consum negarantate (Lending
Club, emise 2007–2018), cu informații despre debitor, termenii creditului
(`funded_amnt`, `term`, `int_rate`, `grade`), statusul curent al creditului
și, pentru creditele intrate în incapacitate de plată, sumele recuperate
(`recoveries`, `collection_recovery_fee`).

### Metodologie

**PD (Probability of Default)** — Regresie logistică, calibrată fără
`class_weight` pentru a păstra probabilitățile interpretabile în magnitudine,
nu doar în ordine de clasificare. Performanță: AUC 0.706, validată prin
comparație cu un proiect independent similar (AUC 0.703). Modelul produce o
probabilitate lifetime (pe toată durata creditului); pentru alinierea cu
convenția reglementară Basel (PD pe orizont de 12 luni), aceasta e
anualizată printr-o conversie hazard-rate constant:

```
PD_anual = 1 - (1 - PD_lifetime)^(1 / maturitate_ani)
```

**LGD (Loss Given Default)** — Calculat empiric, din raportul dintre sumele
recuperate și expunerea la momentul default-ului
(`funded_amnt - total_rec_prncp`), pe subsetul creditelor charged-off. Media
de portofoliu: 90,7%. Segmentarea pe grad de risc (A–G) arată variație
neglijabilă (90,4%–91,0%) — rezultat consistent cu practica reglementară
Basel, unde sub abordarea Foundation IRB, LGD-ul e fixat uniform de
reglementator (45% senior / 75% subordonat) independent de rating-ul
debitorului, tocmai pentru că recuperarea e determinată de senioritate/
colateral, nu de bonitatea inițială. Pentru credit negarantat, fără
diferențiere de colateral între grade, absența variației LGD e teoretic
așteptată: gradul discriminează eficient probabilitatea de default, dar nu
severitatea pierderii odată ce acesta s-a produs.

**EAD (Exposure at Default)** — Calculat consecvent pe tot portofoliul din
valoarea finanțată a creditului.

**EL (Expected Loss)**:

```
EL = PD_anual × LGD × EAD
```

**RWA (Risk-Weighted Assets)** — Formula IRB avansată pentru expuneri
retail: corelație R dependentă de PD (Vasicek single-factor model), funcție
de capital K la percentila de încredere reglementară 99,9%:

```
RWA = K × 12,5 × EAD
```

### Rezultate

| Metrică                     | Valoare                |
| --------------------------- | ---------------------- |
| EAD total                   | $733,5M                |
| Expected Loss (anual)       | $43,4M (5,92% din EAD) |
| RWA total                   | $1,04B                 |
| Densitate capital (RWA/EAD) | 141,5%                 |

Densitate pe grad de risc, crescătoare monoton (validare a coerenței
interne a modelului):

| Grad | PD anual | LGD   | Densitate capital |
| ---- | -------- | ----- | ----------------- |
| A    | 3,30%    | 90,6% | 124,6%            |
| B    | 5,48%    | 91,0% | 136,1%            |
| C    | 7,43%    | 90,8% | 144,1%            |
| D    | 8,85%    | 90,5% | 150,2%            |
| E    | 9,89%    | 90,7% | 155,1%            |
| F    | 11,28%   | 90,4% | 161,2%            |
| G    | 12,18%   | 90,5% | 163,7%            |

### Validare

EL anual (5,92%) e consistent cu un benchmark extern de referință (6–7%).
Calculul inițial, pe bază de PD lifetime necorectat, dăduse 23% din
expunere — discrepanța a fost investigată sistematic (nu ignorată) și
atribuită discordanței de orizont temporal dintre PD-ul modelului (calibrat
implicit pe un target lifetime) și convenția reglementară de PD pe 12 luni,
nu unei erori de calcul a EAD/LGD. Corecția prin anualizare hazard-rate a
adus rezultatul în linia benchmark-ului.

### Limitări cunoscute

- LGD e o medie empirică de portofoliu (respectiv pe grad), nu un model
  predictiv per credit individual.
- Conversia PD lifetime → anual folosește o aproximare de hazard-rate
  constant, nu un model de supraviețuire (survival analysis) dedicat.
- Eșantionul acoperă un interval istoric (2007–2018) care include criza
  financiară din 2008, ceea ce poate supraestima ratele de default față de
  un ciclu economic normal.
- Densitatea de capital (141,5%, peste 100% chiar și pentru gradul A)
  reflectă profilul de risc structural al creditului de consum negarantat
  (LGD ridicat, fără colateral) — nu e direct comparabilă cu benchmark-uri
  de portofolii garantate (ex. ipotecar), unde densitățile tipice sunt
  semnificativ mai mici.

### Cum sunt afișate rezultatele (UI)

- **Carduri KPI** — EAD total, Expected Loss (cu % din EAD), RWA total și
  densitate de capital, cu status vizual (verde/galben/roșu, praguri la 60%
  și 100% densitate).
- **Grafic pe grad de credit** — densitatea de capital per grad (A–G), cu
  linie de referință la 100%; tooltip cu PD mediu, LGD, număr de credite și
  EAD pe grad.
- **Tabel pe grad de credit** — aceleași metrici, în format tabelar.
- **Grafic de calibrare** — PD calibrat vs. rata de default observată, pe
  decile, cu linia de calibrare perfectă ca referință.
