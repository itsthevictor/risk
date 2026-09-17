import Link from 'next/link';
import { IconArrowUpRight } from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className='rounded bg-muted px-1 py-0.5 font-mono text-[0.8em]'>
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className='overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed'>
      {children}
    </pre>
  );
}

function Section({
  id,
  title,
  href,
  children,
}: {
  id?: string;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className='space-y-4 border-t pt-8 first:border-t-0 first:pt-0'>
      <h2 className='text-xl font-bold'>
        <Link href={href} className='inline-flex items-center gap-1 hover:underline'>
          {title}
          <IconArrowUpRight className='size-5' />
        </Link>
      </h2>
      <div className='space-y-4 text-sm leading-relaxed text-foreground/90'>
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className='pt-2 text-base font-semibold'>{children}</h3>;
}

const VAR_METHODS = [
  {
    method: 'Simulare Istorică',
    logic:
      'Percentila empirică a randamentelor efective din fereastra de estimare — nicio presupunere de distribuție.',
  },
  {
    method: 'Parametric (Normal)',
    logic:
      'VaR = portfolio_value · σ · z_cf, cu σ = deviația standard eșantion a randamentelor din fereastră (varianță-covarianță).',
  },
  {
    method: 'EWMA',
    logic:
      'Volatilitate cu decădere exponențială: σ²_t = λ·σ²_{t-1} + (1-λ)·r²_{t-1}, λ = 0.94, inițializată cu deviația standard pe primele 252 de zile.',
  },
  {
    method: 'GARCH(1,1)',
    logic:
      'Volatilitate condiționată calibrată cu pachetul arch (vol="Garch", dist="normal", mean="Zero"); dacă modelul nu converge, cererea eșuează explicit în loc să întoarcă un rezultat nesigur.',
  },
  {
    method: 'Monte Carlo',
    logic:
      '10.000 de simulări N(μ, σ) pe zi (μ, σ din aceeași fereastră ca la metoda parametrică), cu seed fix (42) ca rezultatul să fie reproductibil între cereri identice.',
  },
];

const HQLA_HAIRCUTS = [
  { level: 'L1', haircut: '0%' },
  { level: 'L2A', haircut: '15%' },
  { level: 'L2B', haircut: '25%' },
];

const IRRBB_SCENARIOS = [
  { scenario: 'Paralel sus', shock: '+200 bps pe toată curba' },
  { scenario: 'Paralel jos', shock: '-200 bps pe toată curba' },
  {
    scenario: 'Steepener',
    shock: '-100 bps la capătul scurt, +150 bps la capătul lung (interpolat liniar)',
  },
  {
    scenario: 'Flattener',
    shock: 'curbă de randament alternativă, mai plată, predefinită',
  },
  {
    scenario: 'Short-end sus',
    shock: '+250 bps la capătul scurt, descrescător exponențial spre capătul lung',
  },
  {
    scenario: 'Short-end jos',
    shock: '-250 bps la capătul scurt, descrescător exponențial spre capătul lung',
  },
];

const CREDIT_RESULTS = [
  { metric: 'EAD total', value: '$733,5M' },
  { metric: 'Expected Loss (anual)', value: '$43,4M (5,92% din EAD)' },
  { metric: 'RWA total', value: '$1,04B' },
  { metric: 'Densitate capital (RWA/EAD)', value: '141,5%' },
];

const CREDIT_BY_GRADE = [
  { grade: 'A', pd: '3,30%', lgd: '90,6%', density: '124,6%' },
  { grade: 'B', pd: '5,48%', lgd: '91,0%', density: '136,1%' },
  { grade: 'C', pd: '7,43%', lgd: '90,8%', density: '144,1%' },
  { grade: 'D', pd: '8,85%', lgd: '90,5%', density: '150,2%' },
  { grade: 'E', pd: '9,89%', lgd: '90,7%', density: '155,1%' },
  { grade: 'F', pd: '11,28%', lgd: '90,4%', density: '161,2%' },
  { grade: 'G', pd: '12,18%', lgd: '90,5%', density: '163,7%' },
];

export default function AboutPage() {
  return (
    <div className='mx-auto max-w-4xl space-y-10 p-6'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold'>
          Portofoliu instrumente analiză de risc — proiect personal
        </h1>
        <div className='space-y-2 text-sm leading-relaxed text-muted-foreground'>
          <p>
            <strong className='text-foreground'>Backend</strong> — FastAPI +
            Pydantic (API și validare), SQLModel/SQLAlchemy peste Postgres
            (cache de prețuri), <Code>yfinance</Code> (sursă de date de
            piață), <Code>numpy</Code> / <Code>pandas</Code> (calcul numeric),{' '}
            <Code>scipy</Code> (distribuții statistice) și <Code>arch</Code>{' '}
            (calibrare GARCH).
          </p>
          <p>
            <strong className='text-foreground'>Frontend</strong> — Next.js +
            React + TypeScript, React Hook Form + Zod (formulare și
            validare), TanStack Query (fetching/cache pe client), Recharts
            (grafice), componente shadcn/ui pe bază de Radix/Base UI +
            Tailwind CSS.
          </p>
        </div>
      </div>

      <Section title='1. Risc de Piață (Market Risk)' href='/market'>
        <p>
          Modul de analiză a riscului de piață pentru un portofoliu de active
          (acțiuni, ETF-uri etc.), cu VaR/ES calculat prin 5 metode diferite,
          backtesting istoric al fiecărei metode, și stress testing pe
          scenarii de criză (două scenarii istorice și opțiune de scenariu
          discret personalizat).
        </p>

        <SubHeading>Modele de calcul VaR/ES</SubHeading>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-44'>Metodă</TableHead>
                <TableHead>Logică</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {VAR_METHODS.map((m) => (
                <TableRow key={m.method}>
                  <TableCell className='font-medium'>{m.method}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {m.logic}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p>
          Expected Shortfall (ES) se calculează, pentru fiecare metodă, ca
          media pierderilor care depășesc VaR-ul (istoric) sau prin formula
          închisă a cozii normale <Code>ES = σ · φ(z_cf) / (1 - cf)</Code>{' '}
          (parametric/EWMA/GARCH), respectiv media simulărilor sub prag
          (Monte Carlo).
        </p>

        <SubHeading>Alegeri practice de metodologie</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>Istoric de 15 ani</strong>{' '}
            descărcat prin <Code>yfinance</Code> și cache-uit în Postgres
            (fetch incremental — se cer de la Yahoo doar zilele lipsă, nu tot
            intervalul de fiecare dată). Acest istoric lung e folosit{' '}
            <strong className='text-foreground'>doar</strong> pentru
            backtesting, drawdown și corelații — nu pentru cifra de VaR/ES
            afișată.
          </li>
          <li>
            <strong className='text-foreground'>
              Fereastra de estimare e liberă
            </strong>{' '}
            (<Code>estimation_window_days</Code>, 30–756 zile, implicit 252) —
            cifra de VaR/ES &bdquo;curentă&rdquo; se calculează exclusiv din
            ultimele N zile de randamente, nu din tot istoricul. E o alegere
            deliberată: aplicația răspunde la &bdquo;cât de mare e riscul{' '}
            <em>acum</em>, dat fiind regimul de volatilitate recent&rdquo;,
            nu &bdquo;care a fost cea mai gravă coadă din tot istoricul
            disponibil&rdquo;.
          </li>
          <li>
            <strong className='text-foreground'>Orizont de 1 zi</strong>, fără
            scalare √t la un holding period mai lung — practica standard în
            risk management de piață, care evită autocorelația introdusă de
            randamente cumulate pe ferestre suprapuse.
          </li>
          <li>
            <strong className='text-foreground'>
              Ziua curentă e exclusă
            </strong>{' '}
            din fereastra de estimare (out-of-sample: se estimează riscul
            zilei t doar din randamentele strict anterioare lui t, fără să
            &bdquo;vadă&rdquo; rezultatul zilei respective) și din fetch-ul de
            preț (sesiunea de azi poate fi încă în desfășurare / nepublicată
            la Yahoo).
          </li>
          <li>
            <strong className='text-foreground'>Ponderi egale</strong> pe
            toate activele selectate (2–10 tickere).
          </li>
        </ul>

        <SubHeading>Backtesting</SubHeading>
        <p>
          Pentru fiecare metodă, se rulează un backtest rulant pe tot
          istoricul disponibil (nu doar pe fereastra curentă): pentru fiecare
          zi din trecut, se recalculează ce ar fi spus metoda folosind doar
          datele de dinainte, apoi se compară cu pierderea efectivă realizată.
          Din asta rezultă:
        </p>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>
              Testul Kupiec
            </strong>{' '}
            (unconditional coverage) — verifică dacă <em>numărul</em> de
            depășiri ale VaR se potrivește cu ce ar aștepta nivelul de
            încredere ales.
          </li>
          <li>
            <strong className='text-foreground'>Testul Christoffersen</strong>{' '}
            (independence) — verifică dacă depășirile sunt <em>grupate</em>{' '}
            în timp (clustering, semn de model prost calibrat) sau
            independente.
          </li>
          <li>
            <strong className='text-foreground'>Conditional Coverage</strong>{' '}
            — combinația celor două de mai sus (<Code>LR_cc = LR_uc + LR_ind</Code>).
          </li>
          <li>
            <strong className='text-foreground'>
              Semafor stil Basel
            </strong>{' '}
            (verde/galben/roșu) — pe fereastra ultimelor 250 de zile, compară
            numărul de depășiri cu pragurile binomiale (generalizate la orice
            nivel de încredere ales, nu fixate la pragurile oficiale 4/9 de la
            99%).
          </li>
        </ul>

        <SubHeading>Alte metrici (independente de metoda VaR)</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>Drawdown maxim</strong> — cea
            mai mare scădere vârf-minim a valorii portofoliului, calculată o
            singură dată pe tot istoricul, din randamentele efective
            realizate.
          </li>
          <li>
            <strong className='text-foreground'>
              Beneficiu de diversificare
            </strong>{' '}
            — diferența dintre suma VaR-urilor individuale (per activ,
            izolat) și VaR-ul parametric al portofoliului combinat; folosește
            tot istoricul de 15 ani, nu fereastra de estimare.
          </li>
          <li>
            <strong className='text-foreground'>Matrice de corelație</strong>{' '}
            — corelația randamentelor zilnice între toate activele
            selectate, pe tot istoricul.
          </li>
        </ul>

        <SubHeading>Stress Testing</SubHeading>
        <p>
          Independent de analiza de mai sus (nu refolosește fitul
          GARCH/backtest-ul):
        </p>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>Replay istoric</strong> —
            aplică randamentele reale dintr-o fereastră acută de criză (COVID
            19 feb–20 mar 2020, rate-hike sell-off 27 dec 2021–14 oct 2022,
            sau un interval personalizat) peste portofoliul curent.
          </li>
          <li>
            <strong className='text-foreground'>Scenariu ipotetic</strong> —
            șocuri procentuale editabile per clasă de active
            (equity/bond/commodity), fără să necesite date de piață.
          </li>
        </ul>
        <p>
          Secțiunea e afișată deschisă implicit (nu necesită click), cu
          scenariul 2020 rulat automat imediat ce analiza principală se
          termină.
        </p>

        <SubHeading>Cum sunt afișate rezultatele (UI)</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>Carduri KPI</strong> —
            Volatilitate EWMA, Volatilitate GARCH, Drawdown Maxim, Beneficiu
            de Diversificare; fiecare cu grafic și explicație (formulă + pași
            de implementare) în drawer-ul de info.
          </li>
          <li>
            <strong className='text-foreground'>
              Tabel comparativ VaR/ES
            </strong>{' '}
            — toate cele 5 metode, pe cele 3 niveluri de încredere
            (90/95/99%), în dolari și procent din valoarea portofoliului.
          </li>
          <li>
            <strong className='text-foreground'>
              Tabel scorecard backtest
            </strong>{' '}
            — statusul traffic-light și statisticile
            Kupiec/Christoffersen/CC per metodă, cu selecție interactivă a
            metodei active pentru graficul de mai jos.
          </li>
          <li>
            <strong className='text-foreground'>Grafic PnL vs. VaR</strong> —
            P&L zilnic realizat suprapus peste seria de VaR a metodei
            selectate, cu zilele de depășire (breach) marcate.
          </li>
          <li>
            <strong className='text-foreground'>
              Carduri de rezultat stress test
            </strong>{' '}
            — impact în dolari/procent față de valoarea curentă a
            portofoliului, separat pentru replay istoric și scenariul
            ipotetic.
          </li>
        </ul>
      </Section>

      <Section title='2. Risc de Lichiditate — LCR' href='/liquidity'>
        <p>
          Modul de calcul al Liquidity Coverage Ratio (LCR): raportul dintre
          activele lichide de calitate ridicată (HQLA) și ieșirile nete de
          numerar estimate pe un orizont de stres de 30 de zile calendaristice.
          Datele de intrare sunt introduse manual, printr-un formular de tip
          wizard cu 6 pași (HQLA, depozite retail, depozite en-gros,
          angajamente extrabilanțiere, intrări, rezultat).
        </p>
        <CodeBlock>
          {`LCR = HQLA / Ieșiri nete × 100%
Ieșiri nete = Ieșiri totale − min(Intrări, 75% × Ieșiri totale)`}
        </CodeBlock>

        <SubHeading>Clasificarea HQLA</SubHeading>
        <p>
          Fiecare activ este clasificat pe niveluri (L1/L2A/L2B/ineligibil) în
          funcție de tipul emitentului și, unde e cazul, de banda de rating —
          de exemplu suveranul propriu și numerarul la banca centrală sunt L1
          necondiționat, o obligațiune corporativă AAA-AA e L2A, iar una
          A/BBB e L2B. Maparea completă issuer_type × rating_band → nivel e
          configurabilă în{' '}
          <Code>
            backend/engines/liquidity_risk/config/lcr_params.json
          </Code>
          , nu hardcodată în motorul de calcul.
        </p>
        <p>Pe fiecare nivel se aplică un haircut asupra valorii activului:</p>
        <div className='overflow-hidden rounded-md border sm:w-64'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nivel</TableHead>
                <TableHead>Haircut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HQLA_HAIRCUTS.map((h) => (
                <TableRow key={h.level}>
                  <TableCell className='font-medium'>{h.level}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {h.haircut}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p>
          După haircut, se aplică plafoanele reglementare, în ordine:
        </p>
        <ol className='list-decimal space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>Plafon L2B</strong> — L2B
            este limitat la 15% din (L1 + L2A).
          </li>
          <li>
            <strong className='text-foreground'>Plafon L2 combinat</strong> —
            L2A + L2B (după plafonul de mai sus) este limitat la 40% din HQLA
            total; dacă e depășit, L2B e redus primul, iar dacă tot nu
            ajunge, se reduce și L2A.
          </li>
        </ol>

        <SubHeading>Ieșiri și intrări de numerar</SubHeading>
        <p>
          Pentru depozitele retail, en-gros și angajamentele extrabilanțiere
          se aplică o rată de run-off pe categorie (ex. 5% retail stabil, 10%
          retail mai puțin stabil/IMM, 25% depozit operațional, 40%
          neoperațional corporativ, 100% neoperațional interbancar). Intrările
          (rambursări de împrumuturi, lending garantat) au propriile rate pe
          categorie (0–100%, în funcție de tipul colateralului/contrapărții)
          și sunt plafonate global la 75% din ieșirile totale — o bancă nu se
          poate baza pe intrări pentru a-și acoperi integral ieșirile de
          stres. Toate ratele sunt configurabile în același fișier{' '}
          <Code>lcr_params.json</Code>.
        </p>

        <SubHeading>Cum sunt afișate rezultatele (UI)</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>Formular wizard</strong> —
            datele se introduc pas cu pas (HQLA → retail → en-gros →
            extrabilanțier → intrări), cu validare la navigare între pași și
            salvare automată a draft-ului în <Code>sessionStorage</Code>, ca
            să nu se piardă la refresh accidental.
          </li>
          <li>
            <strong className='text-foreground'>Card de rezultat</strong> —
            Recapitulează toate elementele introduse și afișează LCR-ul
            calculat, cu un status vizual (sub minim / marginal / confortabil,
            în funcție de prag: &lt;100%, 100–120%, ≥120%) și detalierea HQLA
            total, intrări plafonate, ieșiri totale și ieșiri nete.
          </li>
        </ul>
      </Section>

      <Section
        title='3. Risc de Dobândă — IRRBB (NII & EVE)'
        href='/interest-rate'
      >
        <p>
          Modul de Interest Rate Risk in the Banking Book: măsoară
          sensibilitatea băncii la variații ale ratelor de dobândă din două
          perspective complementare — NII (impact pe termen scurt asupra
          profitabilității) și EVE (impact pe termen lung asupra valorii
          economice a capitalului). Spre deosebire de Market Risk și LCR,
          datele de intrare nu sunt introduse manual — portofoliul este
          generat sintetic (100 de poziții mock), cu profiluri de repricing
          și maturitate regenerate per categorie (cash aproape overnight,
          depozite la termen pe termen mediu, obligațiuni guvernamentale și
          credite variabile pe termen lung etc.), reproductibil (seed fix), ca
          să reflecte un profil de scadență realist în ciuda datelor sursă
          (mockaroo) incoerente.
        </p>

        <SubHeading>NII (Net Interest Income)</SubHeading>
        <p>
          Venitul net din dobânzi așteptat pe un orizont de 12 luni, sub un
          șoc paralel de rată (implicit ±200 bps, configurabil din UI):
        </p>
        <CodeBlock>{`NII = Σ dobândă (ASSET) − Σ dobândă (LIABILITY)`}</CodeBlock>
        <p>
          Pentru fiecare poziție: dacă data de repricing cade după finalul
          orizontului, dobânda se calculează la rata curentă pe tot
          orizontul. Altfel, pro-rata — la rata curentă până la repricing,
          apoi la (rata curentă ± șoc) de la repricing până la finalul
          orizontului. ΔNII se calculează față de scenariul de bază (fără
          șoc), separat pentru șocul în sus și în jos.
        </p>

        <SubHeading>EVE (Economic Value of Equity)</SubHeading>
        <p>
          Valoarea economică a capitalului: valoarea prezentă a activelor
          minus valoarea prezentă a pasivelor, actualizate pe curba de
          randament până la data de maturitate a fiecărei poziții:
        </p>
        <CodeBlock>{`EVE = Σ PV (ASSET) − Σ PV (LIABILITY),   PV = principal / (1 + r/100)^t`}</CodeBlock>
        <p>
          Se calculează sub cele 6 scenarii standard de șoc IRRBB, plus
          scenariul de bază — curba de randament e interpolată liniar pe
          ancore de maturitate (0–20 ani), fără extrapolare (plată în afara
          domeniului):
        </p>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-40'>Scenariu</TableHead>
                <TableHead>Șoc aplicat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {IRRBB_SCENARIOS.map((s) => (
                <TableRow key={s.scenario}>
                  <TableCell className='font-medium'>{s.scenario}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {s.shock}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p>
          ΔEVE se calculează față de scenariul de bază pentru fiecare din cele
          6 scenarii de șoc.
        </p>

        <SubHeading>Cum sunt afișate rezultatele (UI)</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>Tab-uri NII / EVE</strong> —
            cele două perspective sunt afișate separat, fiecare cu propriul
            set de carduri KPI și tabel de scenarii.
          </li>
          <li>
            <strong className='text-foreground'>Carduri KPI NII</strong> —
            NII de bază, NII la șoc +bps și -bps, cu ΔNII și grafic comparativ
            pe scenarii; mărimea șocului e selectabilă din UI (100/200/300
            bps).
          </li>
          <li>
            <strong className='text-foreground'>Tabel scenarii NII</strong> —
            venit din dobânzi, cheltuială cu dobânzi, NII și ΔNII, pentru bază
            și cele două șocuri.
          </li>
          <li>
            <strong className='text-foreground'>Carduri KPI EVE</strong> —
            EVE de bază (cu grafic pe toate cele 7 scenarii), cel mai advers
            scenariu (cu ΔEVE și grafic comparativ), și paralel sus vs. jos.
          </li>
          <li>
            <strong className='text-foreground'>Tabel scenarii EVE</strong> —
            valoare prezentă active/pasive, EVE și ΔEVE, pentru toate cele 7
            scenarii (bază + 6 șocuri).
          </li>
          <li>
            <strong className='text-foreground'>
              Pagină &bdquo;Date și metodologie&rdquo;
            </strong>{' '}
            — tabelul complet al celor 100 de poziții sintetice (tip,
            categorie, principal, rată curentă, date de repricing/
            maturitate), sortabil pe orice coloană.
          </li>
        </ul>
      </Section>

      <Section title='4. Risc de Credit' href='/credit'>
        <p>
          Spre deosebire de celelalte module, analiza de risc de credit nu
          rulează live — a fost făcută offline, pe un set de date real (nu
          sintetic), iar rezultatele sunt afișate ca atare în UI. Nu are sens
          recalculul la fiecare request: calibrarea modelului PD durează, iar
          datele sursă (Lending Club) nu se schimbă.
        </p>
        <p>
          <strong className='text-foreground'>Scop</strong> — Estimarea
          pierderii așteptate (Expected Loss) și a cerinței de capital
          reglementar (Risk-Weighted Assets) pentru un portofoliu de credite
          de consum, folosind cadrul standard PD–LGD–EAD din Basel II/III
          (abordarea IRB). Decizia de risc pe care o susține: câtă
          capitalizare trebuie alocată per segment de portofoliu, și ce grade
          de risc concentrează disproporționat expunerea la pierdere
          neașteptată — informație direct utilizabilă în stabilirea
          limitelor de subscriere sau în pricing pe grad.
        </p>
        <p>
          <strong className='text-foreground'>Date</strong> — Portofoliu de
          141.946 credite de consum negarantate (Lending Club, emise
          2007–2018), cu informații despre debitor, termenii creditului (
          <Code>funded_amnt</Code>, <Code>term</Code>, <Code>int_rate</Code>,{' '}
          <Code>grade</Code>), statusul curent al creditului și, pentru
          creditele intrate în incapacitate de plată, sumele recuperate (
          <Code>recoveries</Code>, <Code>collection_recovery_fee</Code>).
        </p>

        <SubHeading>Metodologie</SubHeading>
        <p>
          <strong className='text-foreground'>
            PD (Probability of Default)
          </strong>{' '}
          — Regresie logistică, calibrată fără <Code>class_weight</Code>{' '}
          pentru a păstra probabilitățile interpretabile în magnitudine, nu
          doar în ordine de clasificare. Performanță: AUC 0.706, validată
          prin comparație cu un proiect independent similar (AUC 0.703).
          Modelul produce o probabilitate lifetime (pe toată durata
          creditului); pentru alinierea cu convenția reglementară Basel (PD
          pe orizont de 12 luni), aceasta e anualizată printr-o conversie
          hazard-rate constant:
        </p>
        <CodeBlock>{`PD_anual = 1 - (1 - PD_lifetime)^(1 / maturitate_ani)`}</CodeBlock>
        <p>
          <strong className='text-foreground'>
            LGD (Loss Given Default)
          </strong>{' '}
          — Calculat empiric, din raportul dintre sumele recuperate și
          expunerea la momentul default-ului (
          <Code>funded_amnt - total_rec_prncp</Code>), pe subsetul creditelor
          charged-off. Media de portofoliu: 90,7%. Segmentarea pe grad de
          risc (A–G) arată variație neglijabilă (90,4%–91,0%) — rezultat
          consistent cu practica reglementară Basel, unde sub abordarea
          Foundation IRB, LGD-ul e fixat uniform de reglementator (45% senior
          / 75% subordonat) independent de rating-ul debitorului, tocmai
          pentru că recuperarea e determinată de senioritate/colateral, nu de
          bonitatea inițială. Pentru credit negarantat, fără diferențiere de
          colateral între grade, absența variației LGD e teoretic așteptată:
          gradul discriminează eficient probabilitatea de default, dar nu
          severitatea pierderii odată ce acesta s-a produs.
        </p>
        <p>
          <strong className='text-foreground'>
            EAD (Exposure at Default)
          </strong>{' '}
          — Calculat consecvent pe tot portofoliul din valoarea finanțată a
          creditului.
        </p>
        <p>
          <strong className='text-foreground'>EL (Expected Loss)</strong>:
        </p>
        <CodeBlock>{`EL = PD_anual × LGD × EAD`}</CodeBlock>
        <p>
          <strong className='text-foreground'>
            RWA (Risk-Weighted Assets)
          </strong>{' '}
          — Formula IRB avansată pentru expuneri retail: corelație R
          dependentă de PD (Vasicek single-factor model), funcție de capital
          K la percentila de încredere reglementară 99,9%:
        </p>
        <CodeBlock>{`RWA = K × 12,5 × EAD`}</CodeBlock>

        <SubHeading>Rezultate</SubHeading>
        <div className='overflow-hidden rounded-md border sm:w-96'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metrică</TableHead>
                <TableHead>Valoare</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CREDIT_RESULTS.map((r) => (
                <TableRow key={r.metric}>
                  <TableCell className='font-medium'>{r.metric}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {r.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p>
          Densitate pe grad de risc, crescătoare monoton (validare a
          coerenței interne a modelului):
        </p>
        <div className='overflow-hidden rounded-md border sm:w-xl'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grad</TableHead>
                <TableHead>PD anual</TableHead>
                <TableHead>LGD</TableHead>
                <TableHead>Densitate capital</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CREDIT_BY_GRADE.map((g) => (
                <TableRow key={g.grade}>
                  <TableCell className='font-medium'>{g.grade}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {g.pd}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {g.lgd}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {g.density}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <SubHeading>Validare</SubHeading>
        <p>
          EL anual (5,92%) e consistent cu un benchmark extern de referință
          (6–7%). Calculul inițial, pe bază de PD lifetime necorectat, dăduse
          23% din expunere — discrepanța a fost investigată sistematic (nu
          ignorată) și atribuită mismatch-ului de orizont temporal dintre
          PD-ul modelului (calibrat implicit pe un target lifetime) și
          convenția reglementară de PD pe 12 luni, nu unei erori de calcul a
          EAD/LGD. Corecția prin anualizare hazard-rate a adus rezultatul în
          linia benchmark-ului.
        </p>

        <SubHeading>Limitări cunoscute</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            LGD e o medie empirică de portofoliu (respectiv pe grad), nu un
            model predictiv per credit individual.
          </li>
          <li>
            Conversia PD lifetime → anual folosește o aproximare de
            hazard-rate constant, nu un model de supraviețuire (survival
            analysis) dedicat.
          </li>
          <li>
            Eșantionul acoperă un interval istoric (2007–2018) care include
            criza financiară din 2008, ceea ce poate supraestima ratele de
            default față de un ciclu economic normal.
          </li>
          <li>
            Densitatea de capital (141,5%, peste 100% chiar și pentru gradul
            A) reflectă profilul de risc structural al creditului de consum
            negarantat (LGD ridicat, fără colateral) — nu e direct comparabilă
            cu benchmark-uri de portofolii garantate (ex. ipotecar), unde
            densitățile tipice sunt semnificativ mai mici.
          </li>
        </ul>

        <SubHeading>Cum sunt afișate rezultatele (UI)</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>Carduri KPI</strong> — EAD
            total, Expected Loss (cu % din EAD), RWA total și densitate de
            capital, cu status vizual (verde/galben/roșu, praguri la 60% și
            100% densitate).
          </li>
          <li>
            <strong className='text-foreground'>
              Grafic pe grad de credit
            </strong>{' '}
            — densitatea de capital per grad (A–G), cu linie de referință la
            100%; tooltip cu PD mediu, LGD, număr de credite și EAD pe grad.
          </li>
          <li>
            <strong className='text-foreground'>
              Tabel pe grad de credit
            </strong>{' '}
            — aceleași metrici, în format tabelar.
          </li>
          <li>
            <strong className='text-foreground'>Grafic de calibrare</strong> —
            PD calibrat vs. rata de default observată, pe decile, cu linia de
            calibrare perfectă ca referință.
          </li>
        </ul>
      </Section>
    </div>
  );
}
