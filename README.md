# Portofoliu instrumente analiză de risc - proiect personal Victor Alexa

#### Tehnologii utilizate

**Backend** — FastAPI + Pydantic (API și validare), SQLModel/SQLAlchemy peste
Postgres (cache de prețuri), `yfinance` (sursă de date de piață), `numpy` /
`pandas` (calcul numeric), `scipy` (distribuții statistice) și `arch` (calibrare
GARCH).

**Frontend** — Next.js + React + TypeScript, React Hook Form + Zod (formulare și
validare), TanStack Query (fetching/cache pe client), Recharts (grafice),
componente shadcn/ui pe bază de Radix/Base UI + Tailwind CSS.

## Risc de Piață (Market Risk)

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

## Risc de Lichiditate — LCR

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
