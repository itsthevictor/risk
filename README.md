<a id="romana"></a>

> **Română** (English below) · [Go to English version ↓](#english)

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

### Alți indicatori (independenți de metoda VaR)

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
rezultatele sunt afișate ca atare în UI. Nu are sens recalcularea la fiecare
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

| Indicator                   | Valoare                |
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
- **Tabel pe grad de credit** — aceiași indicatori, în format tabelar.
- **Grafic de calibrare** — PD calibrat vs. rata de default observată, pe
  decile, cu linia de calibrare perfectă ca referință.

---

<a id="english"></a>

> **English** · [Înapoi la versiunea în română ↑](#romana)

# Risk Analysis Tools Portfolio - personal project

#### Tech stack

**Backend** — FastAPI + Pydantic (API and validation), SQLModel/SQLAlchemy on top
of Postgres (price cache), `yfinance` (market data source), `numpy` /
`pandas` (numerical computation), `scipy` (statistical distributions) and `arch`
(GARCH calibration).

**Frontend** — Next.js + React + TypeScript, React Hook Form + Zod (forms and
validation), TanStack Query (client-side fetching/caching), Recharts (charts),
shadcn/ui components built on Radix/Base UI + Tailwind CSS.

## 1. Market Risk

Market risk analysis module for a portfolio of assets (stocks, ETFs, etc.),
with VaR/ES computed using 5 different methods, historical backtesting of each
method, and stress testing on crisis scenarios (two historical scenarios and an
option for a custom discrete scenario).

### VaR/ES models

| Method                    | Logic                                                                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Historical Simulation** | Empirical percentile of actual returns within the estimation window — no distributional assumption.                                                                                                                |
| **Parametric (Normal)**   | `VaR = portfolio_value · σ · z_cf`, with `σ` = sample standard deviation of returns in the window (variance-covariance).                                                                                           |
| **EWMA**                  | Exponentially weighted volatility: `σ²_t = λ·σ²_{t-1} + (1-λ)·r²_{t-1}`, `λ = 0.94`, initialised with the standard deviation of the first 252 days.                                                                |
| **GARCH(1,1)**            | Conditional volatility calibrated with the `arch` package (`vol="Garch"`, `dist="normal"`, `mean="Zero"`); if the model fails to converge, the request fails explicitly instead of returning an unreliable result. |
| **Monte Carlo**           | 10,000 `N(μ, σ)` simulations per day (`μ`, `σ` from the same window as the parametric method), with a fixed `seed` (42) so the result is reproducible across identical requests.                                   |

Expected Shortfall (ES) is computed for each method as the mean of losses
exceeding VaR (historical), via the closed-form normal tail formula
`ES = σ · φ(z_cf) / (1 - cf)` (parametric/EWMA/GARCH), or as the mean of the
simulations beyond the threshold (Monte Carlo).

### Practical methodology choices

- **15 years of history** downloaded via `yfinance` and cached in Postgres
  (incremental fetch — only missing days are requested from Yahoo, not the whole
  range every time). This long history is used **only** for backtesting,
  drawdown and correlations — not for the displayed VaR/ES figure.
- **Configurable estimation window** (`estimation_window_days`, 30–756 days,
  default 252) — the "current" VaR/ES figure is computed exclusively from the
  last N days of returns, not from the full history. This is a deliberate
  choice: the app answers "how large is the risk _now_, given the recent
  volatility regime", not "what was the worst tail in the entire available
  history".
- **1-day horizon**, with no `√t` scaling to a longer holding period — standard
  practice in market risk management, which avoids the autocorrelation
  introduced by cumulative returns over overlapping windows.
- **The current day is excluded** from the estimation window (out-of-sample:
  the risk for day `t` is estimated only from returns strictly before `t`,
  without "seeing" that day's outcome) and from the price fetch (today's
  session may still be in progress / not yet published on Yahoo).
- **Equal weights** across all selected assets (2–10 tickers).

### Backtesting

For each method, a rolling backtest is run over the entire available history
(not just the current window): for every past day, the model recomputes what
the method would have said using only prior data, then compares it with the
loss actually realised. This yields:

- **Kupiec test** (unconditional coverage) — checks whether the _number_ of
  VaR breaches matches what the chosen confidence level would imply.
- **Christoffersen test** (independence) — checks whether breaches are
  _clustered_ in time (a sign of a poorly calibrated model) or independent.
- **Conditional Coverage** — the combination of the two above
  (`LR_cc = LR_uc + LR_ind`).
- **Basel-style traffic light** (green/yellow/red) — over the last 250 days,
  compares the number of breaches with binomial thresholds (generalised to any
  chosen confidence level, not fixed to the official 4/9 thresholds at 99%).

### Other metrics (independent of the VaR method)

- **Maximum drawdown** — the largest peak-to-trough decline in portfolio value,
  computed once over the full history from realised returns.
- **Diversification benefit** — the difference between the sum of individual
  VaRs (per asset, in isolation) and the parametric VaR of the combined
  portfolio; uses the full 15-year history, not the estimation window.
- **Correlation matrix** — correlation of daily returns across all selected
  assets, over the full history.

### Stress Testing

Independent of the analysis above (it does not reuse the GARCH fit/backtest):

- **Historical replay** — applies actual returns from an acute crisis window
  (COVID 19 Feb–20 Mar 2020, rate-hike sell-off 27 Dec 2021–14 Oct 2022, or a
  custom interval) to the current portfolio.
- **Hypothetical scenario** — editable percentage shocks per asset class
  (equity/bond/commodity), requiring no market data.

The section is shown expanded by default (no click needed), with the 2020
scenario run automatically as soon as the main analysis finishes.

### How results are displayed (UI)

- **KPI cards** — EWMA Volatility, GARCH Volatility, Maximum Drawdown,
  Diversification Benefit; each with a chart and an explanation (formula +
  implementation steps) in the info drawer.
- **VaR/ES comparison table** — all 5 methods, at the 3 confidence levels
  (90/95/99%), in dollars and as a percentage of portfolio value.
- **Backtest scorecard table** — traffic-light status and
  Kupiec/Christoffersen/CC statistics per method, with interactive selection of
  the active method for the chart below.
- **PnL vs. VaR chart** — realised daily P&L overlaid on the VaR series of the
  selected method, with breach days highlighted.
- **Stress test result cards** — impact in dollars/percent relative to current
  portfolio value, shown separately for the historical replay and the
  hypothetical scenario.

## 2. Liquidity Risk — LCR

Liquidity Coverage Ratio (LCR) calculation module: the ratio between
high-quality liquid assets (HQLA) and estimated net cash outflows over a
30-calendar-day stress horizon. Inputs are entered manually through a 6-step
wizard form (HQLA, retail deposits, wholesale deposits, off-balance-sheet
commitments, inflows, result).

```
LCR = HQLA / Net outflows × 100%
Net outflows = Total outflows − min(Inflows, 75% × Total outflows)
```

### HQLA classification

Each asset is classified into levels (L1/L2A/L2B/ineligible) based on issuer
type and, where applicable, rating band — for example, the domestic sovereign
and central bank reserves are unconditionally L1, an AAA–AA corporate bond is
L2A, and an A/BBB one is L2B. The full issuer_type × rating_band → level
mapping is configurable in
`backend/engines/liquidity_risk/config/lcr_params.json`, not hardcoded in the
calculation engine.

A haircut is applied to the asset value at each level:

| Level | Haircut |
| ----- | ------- |
| L1    | 0%      |
| L2A   | 15%     |
| L2B   | 25%     |

After haircuts, the regulatory caps are applied in order:

1. **L2B cap** — L2B is limited to 15% of (L1 + L2A).
2. **Combined L2 cap** — L2A + L2B (after the cap above) is limited to 40% of
   total HQLA; if exceeded, L2B is reduced first, and if that is not enough,
   L2A is reduced as well.

### Cash outflows and inflows

A run-off rate per category is applied to retail deposits, wholesale deposits
and off-balance-sheet commitments (e.g. 5% stable retail, 10% less stable
retail/SME, 25% operational deposits, 40% non-operational corporate, 100%
non-operational interbank). Inflows (loan repayments, secured lending) have
their own category rates (0–100%, depending on collateral/counterparty type)
and are capped globally at 75% of total outflows — a bank cannot rely on
inflows to fully cover its stress outflows. All rates are configurable in the
same `lcr_params.json` file.

### How results are displayed (UI)

- **Wizard form** — data is entered step by step (HQLA → retail → wholesale →
  off-balance-sheet → inflows), with validation when moving between steps and
  automatic draft saving to `sessionStorage`, so nothing is lost on an
  accidental refresh.

- **Result card** — Summarises all entered items and shows the calculated LCR,
  with a visual status (below minimum / marginal / comfortable, based on the
  threshold: <100%, 100–120%, ≥120%) and a breakdown of total HQLA, capped
  inflows, total outflows and net outflows.

## 3. Interest Rate Risk — IRRBB (NII & EVE)

Interest Rate Risk in the Banking Book module: measures the bank's sensitivity
to interest rate changes from two complementary perspectives — NII (short-term
impact on profitability) and EVE (long-term impact on the economic value of
equity). Unlike Market Risk and LCR, inputs are not entered manually — the
portfolio is generated synthetically (100 mock positions), with repricing and
maturity profiles regenerated per category (cash near overnight, term deposits
in the medium term, government bonds and floating-rate loans in the long term,
etc.), reproducibly (fixed `seed`), so that it reflects a realistic maturity
profile despite the incoherent source data (mockaroo).

### NII (Net Interest Income)

Expected net interest income over a 12-month horizon, under a parallel rate
shock (default ±200 bps, configurable from the UI):

```
NII = Σ interest (ASSET) − Σ interest (LIABILITY)
```

For each position: if the repricing date falls after the end of the horizon,
interest is calculated at the current rate over the whole horizon. Otherwise,
pro rata — at the current rate until repricing, then at (current rate ±
shock) from repricing to the end of the horizon. ΔNII is computed against the
base scenario (no shock), separately for the up and down shocks.

### EVE (Economic Value of Equity)

Economic value of equity: the present value of assets minus the present value
of liabilities, discounted on the yield curve up to each position's maturity
date:

```
EVE = Σ PV (ASSET) − Σ PV (LIABILITY),   PV = principal / (1 + r/100)^t
```

It is computed under the 6 standard IRRBB shock scenarios, plus the base
scenario — the yield curve is linearly interpolated across maturity anchors
(0–20 years), with no extrapolation (flat outside the range):

| Scenario        | Applied shock                                                               |
| --------------- | --------------------------------------------------------------------------- |
| Parallel up     | +200 bps across the whole curve                                             |
| Parallel down   | -200 bps across the whole curve                                             |
| Steepener       | -100 bps at the short end, +150 bps at the long end (linearly interpolated) |
| Flattener       | predefined alternative, flatter yield curve                                 |
| Short rate up   | +250 bps at the short end, decaying exponentially towards the long end      |
| Short rate down | -250 bps at the short end, decaying exponentially towards the long end      |

ΔEVE is computed against the base scenario for each of the 6 shock scenarios.

### How results are displayed (UI)

- **NII / EVE tabs** — the two perspectives are displayed separately, each
  with its own set of KPI cards and scenario table.
- **NII KPI cards** — base NII, NII under +bps and -bps shocks, with ΔNII and
  a comparative chart across scenarios; shock size is selectable in the UI
  (100/200/300 bps).
- **NII scenario table** — interest income, interest expense, NII and ΔNII,
  for the base case and both shocks.
- **EVE KPI cards** — base EVE (with a chart of all 7 scenarios), the most
  adverse scenario (with ΔEVE and a comparative chart), and parallel up vs.
  down.
- **EVE scenario table** — present value of assets/liabilities, EVE and ΔEVE,
  for all 7 scenarios (base + 6 shocks).
- **"Data and methodology" page** — the full table of the 100 synthetic
  positions (type, category, principal, current rate, repricing/maturity
  dates), sortable by any column.

## 4. Credit Risk

Unlike the other modules, the credit risk analysis does not run live — it was
performed offline on a real (not synthetic) dataset, and the results are shown
as-is in the UI. Recomputing on every request makes no sense: calibrating the
PD model takes time, and the source data (Lending Club) does not change.

**Purpose** — Estimate Expected Loss and the regulatory capital requirement
(Risk-Weighted Assets) for a consumer loan portfolio, using the standard
Basel II/III PD–LGD–EAD framework (IRB approach). The risk decision it
supports: how much capital should be allocated per portfolio segment, and
which risk grades concentrate a disproportionate share of unexpected loss
exposure — information directly usable when setting underwriting limits or
grade-based pricing.

**Data** — A portfolio of 141,946 unsecured consumer loans (Lending Club,
originated 2007–2018), with borrower information, loan terms (`funded_amnt`,
`term`, `int_rate`, `grade`), current loan status and, for defaulted loans,
recovered amounts (`recoveries`, `collection_recovery_fee`).

### Methodology

**PD (Probability of Default)** — Logistic regression, calibrated without
`class_weight` to keep probabilities interpretable in magnitude, not just in
ranking order. Performance: AUC 0.706, validated against a similar independent
project (AUC 0.703). The model produces a lifetime probability (over the full
life of the loan); to align with the Basel regulatory convention (12-month PD
horizon), it is annualised using a constant hazard-rate conversion:

```
PD_annual = 1 - (1 - PD_lifetime)^(1 / maturity_years)
```

**LGD (Loss Given Default)** — Computed empirically as the ratio between
recovered amounts and exposure at the time of default
(`funded_amnt - total_rec_prncp`), on the subset of charged-off loans.
Portfolio average: 90.7%. Segmentation by risk grade (A–G) shows negligible
variation (90.4%–91.0%) — a result consistent with Basel regulatory practice,
where under the Foundation IRB approach LGD is set uniformly by the regulator
(45% senior / 75% subordinated) regardless of the borrower's rating, precisely
because recovery is driven by seniority/collateral rather than initial
creditworthiness. For unsecured credit, with no collateral differentiation
across grades, the absence of LGD variation is theoretically expected: the
grade effectively discriminates the probability of default, but not the
severity of loss once default has occurred.

**EAD (Exposure at Default)** — Computed consistently across the whole
portfolio from the funded loan amount.

**EL (Expected Loss)**:

```
EL = PD_annual × LGD × EAD
```

**RWA (Risk-Weighted Assets)** — Advanced IRB formula for retail exposures:
PD-dependent correlation R (Vasicek single-factor model), capital function K
at the 99.9% regulatory confidence level:

```
RWA = K × 12.5 × EAD
```

### Results

| Metric                    | Value                 |
| ------------------------- | --------------------- |
| Total EAD                 | $733.5M               |
| Expected Loss (annual)    | $43.4M (5.92% of EAD) |
| Total RWA                 | $1.04B                |
| Capital density (RWA/EAD) | 141.5%                |

Density by risk grade, monotonically increasing (a check of the model's
internal consistency):

| Grade | Annual PD | LGD   | Capital density |
| ----- | --------- | ----- | --------------- |
| A     | 3.30%     | 90.6% | 124.6%          |
| B     | 5.48%     | 91.0% | 136.1%          |
| C     | 7.43%     | 90.8% | 144.1%          |
| D     | 8.85%     | 90.5% | 150.2%          |
| E     | 9.89%     | 90.7% | 155.1%          |
| F     | 11.28%    | 90.4% | 161.2%          |
| G     | 12.18%    | 90.5% | 163.7%          |

### Validation

Annual EL (5.92%) is consistent with an external reference benchmark (6–7%).
The initial calculation, based on uncorrected lifetime PD, had produced 23% of
exposure — the discrepancy was investigated systematically (not ignored) and
attributed to the time-horizon mismatch between the model's PD (implicitly
calibrated on a lifetime target) and the 12-month regulatory PD convention,
not to an error in the EAD/LGD calculation. The hazard-rate annualisation
correction brought the result in line with the benchmark.

### Known limitations

- LGD is an empirical portfolio (or per-grade) average, not a predictive model
  per individual loan.
- The lifetime → annual PD conversion uses a constant hazard-rate
  approximation, not a dedicated survival analysis model.
- The sample covers a historical period (2007–2018) that includes the 2008
  financial crisis, which may overstate default rates relative to a normal
  economic cycle.
- Capital density (141.5%, above 100% even for grade A) reflects the
  structural risk profile of unsecured consumer credit (high LGD, no
  collateral) — it is not directly comparable with benchmarks for secured
  portfolios (e.g. mortgages), where typical densities are significantly
  lower.

### How results are displayed (UI)

- **KPI cards** — Total EAD, Expected Loss (with % of EAD), total RWA and
  capital density, with a visual status (green/yellow/red, thresholds at 60%
  and 100% density).
- **Chart by credit grade** — capital density per grade (A–G), with a 100%
  reference line; tooltip with average PD, LGD, number of loans and EAD per
  grade.
- **Table by credit grade** — the same metrics, in tabular form.
- **Calibration chart** — calibrated PD vs. observed default rate, by decile,
  with the perfect-calibration line as reference.
