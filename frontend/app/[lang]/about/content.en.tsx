import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Code, CodeBlock, Section, SubHeading } from './shared';

const VAR_METHODS = [
  {
    method: 'Historical Simulation',
    logic:
      'Empirical percentile of the actual returns in the estimation window — no distributional assumption.',
  },
  {
    method: 'Parametric (Normal)',
    logic:
      'VaR = portfolio_value · σ · z_cf, where σ = sample standard deviation of returns in the window (variance-covariance).',
  },
  {
    method: 'EWMA',
    logic:
      'Exponentially decaying volatility: σ²_t = λ·σ²_{t-1} + (1-λ)·r²_{t-1}, λ = 0.94, initialised with the standard deviation of the first 252 days.',
  },
  {
    method: 'GARCH(1,1)',
    logic:
      'Conditional volatility calibrated with the arch package (vol="Garch", dist="normal", mean="Zero"); if the model fails to converge, the request fails explicitly instead of returning an unreliable result.',
  },
  {
    method: 'Monte Carlo',
    logic:
      '10,000 N(μ, σ) simulations per day (μ, σ from the same window as the parametric method), with a fixed seed (42) so the result is reproducible across identical requests.',
  },
];

const HQLA_HAIRCUTS = [
  { level: 'L1', haircut: '0%' },
  { level: 'L2A', haircut: '15%' },
  { level: 'L2B', haircut: '25%' },
];

const IRRBB_SCENARIOS = [
  { scenario: 'Parallel up', shock: '+200 bps across the whole curve' },
  { scenario: 'Parallel down', shock: '-200 bps across the whole curve' },
  {
    scenario: 'Steepener',
    shock:
      '-100 bps at the short end, +150 bps at the long end (linearly interpolated)',
  },
  {
    scenario: 'Flattener',
    shock: 'predefined alternative, flatter yield curve',
  },
  {
    scenario: 'Short-end up',
    shock:
      '+250 bps at the short end, decaying exponentially towards the long end',
  },
  {
    scenario: 'Short-end down',
    shock:
      '-250 bps at the short end, decaying exponentially towards the long end',
  },
];

const CREDIT_RESULTS = [
  { metric: 'Total EAD', value: '$733.5M' },
  { metric: 'Expected Loss (annual)', value: '$43.4M (5.92% of EAD)' },
  { metric: 'Total RWA', value: '$1.04B' },
  { metric: 'Capital density (RWA/EAD)', value: '141.5%' },
];

const CREDIT_BY_GRADE = [
  { grade: 'A', pd: '3.30%', lgd: '90.6%', density: '124.6%' },
  { grade: 'B', pd: '5.48%', lgd: '91.0%', density: '136.1%' },
  { grade: 'C', pd: '7.43%', lgd: '90.8%', density: '144.1%' },
  { grade: 'D', pd: '8.85%', lgd: '90.5%', density: '150.2%' },
  { grade: 'E', pd: '9.89%', lgd: '90.7%', density: '155.1%' },
  { grade: 'F', pd: '11.28%', lgd: '90.4%', density: '161.2%' },
  { grade: 'G', pd: '12.18%', lgd: '90.5%', density: '163.7%' },
];

export default function AboutEn() {
  return (
    <div className='mx-auto w-full max-w-4xl space-y-8 overflow-x-hidden p-4 sm:space-y-10 sm:p-6'>
      <div className='space-y-2'>
        <h1 className='text-xl font-bold sm:text-2xl'>
          Risk analysis tools portfolio — personal project
        </h1>
        <div className='space-y-2 text-sm leading-relaxed text-muted-foreground mt-6'>
          <p>
            <strong className='text-foreground'>Backend</strong> — FastAPI +
            Pydantic (API and validation), SQLModel/SQLAlchemy on Postgres
            (price cache), <Code>yfinance</Code> (market data source),{' '}
            <Code>numpy</Code> / <Code>pandas</Code> (numerical computing),{' '}
            <Code>scipy</Code> (statistical distributions) and <Code>arch</Code>{' '}
            (GARCH calibration).
          </p>
          <p>
            <strong className='text-foreground'>Frontend</strong> — Next.js +
            React + TypeScript, React Hook Form + Zod (forms and validation),
            TanStack Query (client-side fetching/caching), Recharts (charts),
            shadcn/ui components built on Radix/Base UI + Tailwind CSS.
          </p>
        </div>
      </div>

      <Section title='1. Market Risk' href='/market'>
        <p>
          Market risk analysis module for a portfolio of assets (stocks, ETFs,
          etc.), with VaR/ES computed using 5 different methods, historical
          backtesting of each method, and stress testing on crisis scenarios
          (two historical scenarios and an optional custom hypothetical
          scenario).
        </p>

        <SubHeading>VaR/ES models</SubHeading>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-32 sm:w-44'>Method</TableHead>
                <TableHead>Logic</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {VAR_METHODS.map((m) => (
                <TableRow key={m.method}>
                  <TableCell className='font-medium whitespace-nowrap'>
                    {m.method}
                  </TableCell>
                  <TableCell className='whitespace-normal text-muted-foreground'>
                    {m.logic}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p>
          Expected Shortfall (ES) is computed for each method as the mean of the
          losses exceeding VaR (historical), via the closed-form normal tail
          formula <Code>ES = σ · φ(z_cf) / (1 - cf)</Code>{' '}
          (parametric/EWMA/GARCH), or as the mean of the simulations below the
          threshold (Monte Carlo).
        </p>

        <SubHeading>Practical methodology choices</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>15 years of history</strong>{' '}
            downloaded via <Code>yfinance</Code> and cached in Postgres
            (incremental fetch — only the missing days are requested from Yahoo,
            not the full range every time). This long history is used{' '}
            <strong className='text-foreground'>only</strong> for backtesting,
            drawdown and correlations — not for the displayed VaR/ES figure.
          </li>
          <li>
            <strong className='text-foreground'>
              Adjustable estimation window
            </strong>{' '}
            (<Code>estimation_window_days</Code>, 30–756 days, default 252) —
            the &ldquo;current&rdquo; VaR/ES figure is computed exclusively from
            the last N days of returns, not from the full history. This is
            deliberate: the app answers &ldquo;how large is the risk{' '}
            <em>now</em>, given the recent volatility regime&rdquo;, not
            &ldquo;what was the worst tail in all the available history&rdquo;.
          </li>
          <li>
            <strong className='text-foreground'>1-day horizon</strong>, with no
            √t scaling to a longer holding period — standard practice in market
            risk management, which avoids the autocorrelation introduced by
            returns cumulated over overlapping windows.
          </li>
          <li>
            <strong className='text-foreground'>
              The current day is excluded
            </strong>{' '}
            from the estimation window (out-of-sample: the risk for day t is
            estimated only from returns strictly before t, without
            &ldquo;seeing&rdquo; that day&rsquo;s outcome) and from the price
            fetch (today&rsquo;s session may still be in progress / not yet
            published on Yahoo).
          </li>
          <li>
            <strong className='text-foreground'>Equal weights</strong> across
            all selected assets (2–10 tickers).
          </li>
        </ul>

        <SubHeading>Backtesting</SubHeading>
        <p>
          For each method, a rolling backtest is run over the full available
          history (not just the current window): for every past day, the app
          recomputes what the method would have said using only the data
          available before that day, then compares it with the actual realised
          loss. This produces:
        </p>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>Kupiec test</strong>{' '}
            (unconditional coverage) — checks whether the <em>number</em> of VaR
            breaches matches what the chosen confidence level would predict.
          </li>
          <li>
            <strong className='text-foreground'>Christoffersen test</strong>{' '}
            (independence) — checks whether breaches are <em>clustered</em> in
            time (a sign of a poorly calibrated model) or independent.
          </li>
          <li>
            <strong className='text-foreground'>Conditional Coverage</strong> —
            the combination of the two above (
            <Code>LR_cc = LR_uc + LR_ind</Code>).
          </li>
          <li>
            <strong className='text-foreground'>
              Basel-style traffic light
            </strong>{' '}
            (green/yellow/red) — over the last 250 days, compares the number of
            breaches against binomial thresholds (generalised to any chosen
            confidence level, rather than fixed at the official 4/9 thresholds
            for 99%).
          </li>
        </ul>

        <SubHeading>Other metrics (independent of the VaR method)</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>Maximum drawdown</strong> — the
            largest peak-to-trough decline in portfolio value, computed once
            over the full history from actual realised returns.
          </li>
          <li>
            <strong className='text-foreground'>Diversification benefit</strong>{' '}
            — the difference between the sum of the individual VaRs (per asset,
            in isolation) and the parametric VaR of the combined portfolio; uses
            the full 15-year history, not the estimation window.
          </li>
          <li>
            <strong className='text-foreground'>Correlation matrix</strong> —
            correlation of daily returns across all selected assets, over the
            full history.
          </li>
        </ul>

        <SubHeading>Stress Testing</SubHeading>
        <p>
          Independent of the analysis above (it does not reuse the GARCH fit or
          the backtest):
        </p>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>Historical replay</strong> —
            applies the actual returns from an acute crisis window (COVID, 19
            Feb–20 Mar 2020; rate-hike sell-off, 27 Dec 2021–14 Oct 2022; or a
            custom range) to the current portfolio.
          </li>
          <li>
            <strong className='text-foreground'>Hypothetical scenario</strong> —
            editable percentage shocks per asset class (equity/bond/commodity),
            with no market data required.
          </li>
        </ul>
        <p>
          This section is expanded by default (no click needed), and the 2020
          scenario runs automatically as soon as the main analysis finishes.
        </p>

        <SubHeading>How results are displayed (UI)</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>KPI cards</strong> — EWMA
            volatility, GARCH volatility, maximum drawdown, diversification
            benefit; each with a chart and an explanation (formula +
            implementation steps) in the info drawer.
          </li>
          <li>
            <strong className='text-foreground'>VaR/ES comparison table</strong>{' '}
            — all 5 methods at the 3 confidence levels (90/95/99%), in dollars
            and as a percentage of portfolio value.
          </li>
          <li>
            <strong className='text-foreground'>
              Backtest scorecard table
            </strong>{' '}
            — traffic-light status and Kupiec/Christoffersen/CC statistics per
            method, with interactive selection of the active method for the
            chart below.
          </li>
          <li>
            <strong className='text-foreground'>PnL vs. VaR chart</strong> —
            realised daily P&L overlaid on the VaR series of the selected
            method, with breach days marked.
          </li>
          <li>
            <strong className='text-foreground'>
              Stress test result cards
            </strong>{' '}
            — impact in dollars/percent relative to the current portfolio value,
            shown separately for the historical replay and the hypothetical
            scenario.
          </li>
        </ul>
      </Section>

      <Section title='2. Liquidity Risk — LCR' href='/liquidity'>
        <p>
          Module for calculating the Liquidity Coverage Ratio (LCR): the ratio
          of high-quality liquid assets (HQLA) to the net cash outflows expected
          over a 30-calendar-day stress horizon. Inputs are entered manually
          through a 6-step wizard form (HQLA, retail deposits, wholesale
          deposits, off-balance-sheet commitments, inflows, result).
        </p>
        <CodeBlock>
          {`LCR = HQLA / Net outflows × 100%
Net outflows = Total outflows − min(Inflows, 75% × Total outflows)`}
        </CodeBlock>

        <SubHeading>HQLA classification</SubHeading>
        <p>
          Each asset is classified into a level (L1/L2A/L2B/ineligible) based on
          the issuer type and, where applicable, the rating band — for example,
          the domestic sovereign and central bank cash are unconditionally L1,
          an AAA-AA corporate bond is L2A, and an A/BBB one is L2B. The full
          issuer_type × rating_band → level mapping is configurable in{' '}
          <Code>backend/engines/liquidity_risk/config/lcr_params.json</Code>,
          not hardcoded in the calculation engine.
        </p>
        <p>A haircut is applied to the asset value at each level:</p>
        <div className='overflow-hidden rounded-md border sm:w-64'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
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
        <p>After haircuts, the regulatory caps are applied in order:</p>
        <ol className='list-decimal space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>L2B cap</strong> — L2B is
            limited to 15% of (L1 + L2A).
          </li>
          <li>
            <strong className='text-foreground'>Combined L2 cap</strong> — L2A +
            L2B (after the cap above) is limited to 40% of total HQLA; if
            exceeded, L2B is reduced first, and if that is not enough, L2A is
            reduced as well.
          </li>
        </ol>

        <SubHeading>Cash outflows and inflows</SubHeading>
        <p>
          A run-off rate per category is applied to retail deposits, wholesale
          deposits and off-balance-sheet commitments (e.g. 5% stable retail, 10%
          less stable retail/SME, 25% operational deposits, 40% non-operational
          corporate, 100% non-operational interbank). Inflows (loan repayments,
          secured lending) have their own rates per category (0–100%, depending
          on the collateral/counterparty type) and are capped overall at 75% of
          total outflows — a bank cannot rely on inflows to fully cover its
          stressed outflows. All rates are configurable in the same{' '}
          <Code>lcr_params.json</Code> file.
        </p>

        <SubHeading>How results are displayed (UI)</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>Wizard form</strong> — data is
            entered step by step (HQLA → retail → wholesale → off-balance-sheet
            → inflows), with validation when moving between steps and the draft
            saved automatically to <Code>sessionStorage</Code>, so it
            isn&rsquo;t lost on an accidental refresh.
          </li>
          <li>
            <strong className='text-foreground'>Result card</strong> —
            summarises all the inputs and shows the calculated LCR, with a
            visual status (below minimum / marginal / comfortable, based on the
            threshold: &lt;100%, 100–120%, ≥120%) and a breakdown of total HQLA,
            capped inflows, total outflows and net outflows.
          </li>
        </ul>
      </Section>

      <Section
        title='3. Interest Rate Risk — IRRBB (NII & EVE)'
        href='/interest-rate'
      >
        <p>
          Interest Rate Risk in the Banking Book module: measures the
          bank&rsquo;s sensitivity to interest rate changes from two
          complementary perspectives — NII (short-term impact on profitability)
          and EVE (long-term impact on the economic value of equity). Unlike
          Market Risk and LCR, the inputs are not entered manually — the
          portfolio is generated synthetically (100 mock positions), with
          repricing and maturity profiles regenerated per category (cash close
          to overnight, term deposits at medium term, government bonds and
          floating-rate loans at long term, etc.), reproducibly (fixed seed), so
          that it reflects a realistic maturity profile despite the inconsistent
          source data (mockaroo).
        </p>

        <SubHeading>NII (Net Interest Income)</SubHeading>
        <p>
          Expected net interest income over a 12-month horizon, under a parallel
          rate shock (±200 bps by default, configurable in the UI):
        </p>
        <CodeBlock>{`NII = Σ interest (ASSET) − Σ interest (LIABILITY)`}</CodeBlock>
        <p>
          For each position: if the repricing date falls after the end of the
          horizon, interest is calculated at the current rate for the whole
          horizon. Otherwise, pro rata — at the current rate until repricing,
          then at (current rate ± shock) from repricing to the end of the
          horizon. ΔNII is calculated against the base scenario (no shock),
          separately for the up and down shocks.
        </p>

        <SubHeading>EVE (Economic Value of Equity)</SubHeading>
        <p>
          The economic value of equity: the present value of assets minus the
          present value of liabilities, discounted on the yield curve to the
          maturity date of each position:
        </p>
        <CodeBlock>{`EVE = Σ PV (ASSET) − Σ PV (LIABILITY),   PV = principal / (1 + r/100)^t`}</CodeBlock>
        <p>
          It is calculated under the 6 standard IRRBB shock scenarios plus the
          base scenario — the yield curve is linearly interpolated between
          maturity anchors (0–20 years), with no extrapolation (flat outside the
          range):
        </p>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-28 sm:w-40'>Scenario</TableHead>
                <TableHead>Applied shock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {IRRBB_SCENARIOS.map((s) => (
                <TableRow key={s.scenario}>
                  <TableCell className='font-medium whitespace-nowrap'>
                    {s.scenario}
                  </TableCell>
                  <TableCell className='whitespace-normal text-muted-foreground'>
                    {s.shock}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p>
          ΔEVE is calculated against the base scenario for each of the 6 shock
          scenarios.
        </p>

        <SubHeading>How results are displayed (UI)</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>NII / EVE tabs</strong> — the
            two perspectives are shown separately, each with its own set of KPI
            cards and scenario table.
          </li>
          <li>
            <strong className='text-foreground'>NII KPI cards</strong> — base
            NII, NII under the +bps and -bps shocks, with ΔNII and a scenario
            comparison chart; the shock size is selectable in the UI
            (100/200/300 bps).
          </li>
          <li>
            <strong className='text-foreground'>NII scenario table</strong> —
            interest income, interest expense, NII and ΔNII for the base case
            and both shocks.
          </li>
          <li>
            <strong className='text-foreground'>EVE KPI cards</strong> — base
            EVE (with a chart across all 7 scenarios), the most adverse scenario
            (with ΔEVE and a comparison chart), and parallel up vs. down.
          </li>
          <li>
            <strong className='text-foreground'>EVE scenario table</strong> —
            present value of assets/liabilities, EVE and ΔEVE for all 7
            scenarios (base + 6 shocks).
          </li>
          <li>
            <strong className='text-foreground'>
              &ldquo;Data and methodology&rdquo; page
            </strong>{' '}
            — the full table of the 100 synthetic positions (type, category,
            principal, current rate, repricing/maturity dates), sortable by any
            column.
          </li>
        </ul>
      </Section>

      <Section title='4. Credit Risk' href='/credit'>
        <p>
          Unlike the other modules, the credit risk analysis does not run live —
          it was done offline on a real (not synthetic) dataset, and the results
          are displayed as-is in the UI. Recomputing on every request makes no
          sense: calibrating the PD model takes time, and the source data
          (Lending Club) does not change.
        </p>
        <p>
          <strong className='text-foreground'>Purpose</strong> — Estimating the
          Expected Loss and the regulatory capital requirement (Risk-Weighted
          Assets) for a consumer loan portfolio, using the standard PD–LGD–EAD
          framework from Basel II/III (IRB approach). The risk decision it
          supports: how much capital should be allocated per portfolio segment,
          and which risk grades carry a disproportionate share of unexpected
          loss exposure — information directly usable for setting underwriting
          limits or for pricing by grade.
        </p>
        <p>
          <strong className='text-foreground'>Data</strong> — A portfolio of
          141,946 unsecured consumer loans (Lending Club, issued 2007–2018),
          with borrower information, loan terms (<Code>funded_amnt</Code>,{' '}
          <Code>term</Code>, <Code>int_rate</Code>, <Code>grade</Code>), the
          current loan status and, for defaulted loans, the amounts recovered (
          <Code>recoveries</Code>, <Code>collection_recovery_fee</Code>).
        </p>

        <SubHeading>Methodology</SubHeading>
        <p>
          <strong className='text-foreground'>
            PD (Probability of Default)
          </strong>{' '}
          — Logistic regression, calibrated without <Code>class_weight</Code> so
          the probabilities stay interpretable in magnitude, not just in ranking
          order. Performance: AUC 0.706, validated against a similar independent
          project (AUC 0.703). The model produces a lifetime probability (over
          the full life of the loan); to align with the Basel regulatory
          convention (12-month PD), it is annualised using a constant
          hazard-rate conversion:
        </p>
        <CodeBlock>{`PD_annual = 1 - (1 - PD_lifetime)^(1 / maturity_years)`}</CodeBlock>
        <p>
          <strong className='text-foreground'>LGD (Loss Given Default)</strong>{' '}
          — Calculated empirically from the ratio of recovered amounts to the
          exposure at the time of default (
          <Code>funded_amnt - total_rec_prncp</Code>), on the subset of
          charged-off loans. Portfolio average: 90.7%. Segmenting by risk grade
          (A–G) shows negligible variation (90.4%–91.0%) — consistent with Basel
          regulatory practice, where under the Foundation IRB approach LGD is
          set uniformly by the regulator (45% senior / 75% subordinated)
          regardless of the borrower&rsquo;s rating, precisely because recovery
          is driven by seniority/collateral rather than initial
          creditworthiness. For unsecured credit, with no collateral
          differentiation between grades, the lack of LGD variation is
          theoretically expected: the grade discriminates effectively on the
          probability of default, but not on loss severity once default has
          occurred.
        </p>
        <p>
          <strong className='text-foreground'>EAD (Exposure at Default)</strong>{' '}
          — Calculated consistently across the whole portfolio from the funded
          amount of the loan.
        </p>
        <p>
          <strong className='text-foreground'>EL (Expected Loss)</strong>:
        </p>
        <CodeBlock>{`EL = PD_annual × LGD × EAD`}</CodeBlock>
        <p>
          <strong className='text-foreground'>
            RWA (Risk-Weighted Assets)
          </strong>{' '}
          — Advanced IRB formula for retail exposures: PD-dependent correlation
          R (Vasicek single-factor model), capital function K at the 99.9%
          regulatory confidence level:
        </p>
        <CodeBlock>{`RWA = K × 12.5 × EAD`}</CodeBlock>

        <SubHeading>Results</SubHeading>
        <div className='overflow-hidden rounded-md border sm:w-96'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
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
          Capital density by risk grade, increasing monotonically (a check of
          the model&rsquo;s internal consistency):
        </p>
        <div className='overflow-hidden rounded-md border sm:w-xl'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Annual PD</TableHead>
                <TableHead>LGD</TableHead>
                <TableHead>Capital density</TableHead>
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

        <SubHeading>Validation</SubHeading>
        <p>
          The annual EL (5.92%) is consistent with an external reference
          benchmark (6–7%). The initial calculation, based on uncorrected
          lifetime PD, gave 23% of exposure — the discrepancy was investigated
          systematically (not ignored) and traced to the time-horizon mismatch
          between the model&rsquo;s PD (implicitly calibrated on a lifetime
          target) and the 12-month regulatory PD convention, not to an error in
          the EAD/LGD calculation. The hazard-rate annualisation brought the
          result in line with the benchmark.
        </p>

        <SubHeading>Known limitations</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            LGD is an empirical portfolio average (and per-grade average), not a
            predictive model for each individual loan.
          </li>
          <li>
            The lifetime → annual PD conversion uses a constant hazard-rate
            approximation, not a dedicated survival analysis model.
          </li>
          <li>
            The sample covers a historical period (2007–2018) that includes the
            2008 financial crisis, which may overstate default rates compared
            with a normal economic cycle.
          </li>
          <li>
            The capital density (141.5%, above 100% even for grade A) reflects
            the structural risk profile of unsecured consumer credit (high LGD,
            no collateral) — it is not directly comparable with benchmarks for
            secured portfolios (e.g. mortgages), where typical densities are
            significantly lower.
          </li>
        </ul>

        <SubHeading>How results are displayed (UI)</SubHeading>
        <ul className='list-disc space-y-2 pl-5 text-muted-foreground'>
          <li>
            <strong className='text-foreground'>KPI cards</strong> — total EAD,
            Expected Loss (with % of EAD), total RWA and capital density, with a
            visual status (green/yellow/red, thresholds at 60% and 100%
            density).
          </li>
          <li>
            <strong className='text-foreground'>Chart by credit grade</strong> —
            capital density per grade (A–G), with a reference line at 100%;
            tooltip with average PD, LGD, number of loans and EAD per grade.
          </li>
          <li>
            <strong className='text-foreground'>Table by credit grade</strong> —
            the same metrics in table form.
          </li>
          <li>
            <strong className='text-foreground'>Calibration chart</strong> —
            calibrated PD vs. observed default rate, by decile, with the perfect
            calibration line as a reference.
          </li>
        </ul>
      </Section>
    </div>
  );
}
