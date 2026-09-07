'use client';

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts';

interface PortfolioSummary {
  n_loans: number;
  ead_total: number;
  el_total: number;
  el_pct: number;
  rwa_total: number;
  capital_density: number;
}

interface GradeRow {
  grade: string;
  n_credite: number;
  PD_mediu: number;
  LGD_grade: number;
  EAD_total: number;
  RWA_total: number;
  densitate_capital: number;
}

interface CalibrationPoint {
  decile: number;
  pd_predicted: number;
  default_actual: number;
}

interface CreditRiskSummary {
  portfolio: PortfolioSummary;
  by_grade: GradeRow[];
  calibration: CalibrationPoint[];
}

const MOCK_RESPONSE: CreditRiskSummary = {
  portfolio: {
    n_loans: 141946,
    ead_total: 733541901,
    el_total: 43442802,
    el_pct: 0.0592,
    rwa_total: 1037773755,
    capital_density: 1.415,
  },
  by_grade: [
    {
      grade: 'A',
      n_credite: 26974,
      PD_mediu: 0.033,
      LGD_grade: 0.9055,
      EAD_total: 122876084,
      RWA_total: 153093563,
      densitate_capital: 1.2459,
    },
    {
      grade: 'B',
      n_credite: 41651,
      PD_mediu: 0.0548,
      LGD_grade: 0.9095,
      EAD_total: 180333801,
      RWA_total: 245507834,
      densitate_capital: 1.3614,
    },
    {
      grade: 'C',
      n_credite: 40878,
      PD_mediu: 0.0743,
      LGD_grade: 0.9084,
      EAD_total: 218539185,
      RWA_total: 314913427,
      densitate_capital: 1.441,
    },
    {
      grade: 'D',
      n_credite: 20354,
      PD_mediu: 0.0885,
      LGD_grade: 0.905,
      EAD_total: 123948991,
      RWA_total: 186132001,
      densitate_capital: 1.5017,
    },
    {
      grade: 'E',
      n_credite: 8660,
      PD_mediu: 0.0989,
      LGD_grade: 0.9073,
      EAD_total: 58769728,
      RWA_total: 91171938,
      densitate_capital: 1.5513,
    },
    {
      grade: 'F',
      n_credite: 2661,
      PD_mediu: 0.1128,
      LGD_grade: 0.9042,
      EAD_total: 21415401,
      RWA_total: 34523387,
      densitate_capital: 1.6121,
    },
    {
      grade: 'G',
      n_credite: 768,
      PD_mediu: 0.1218,
      LGD_grade: 0.9049,
      EAD_total: 7658712,
      RWA_total: 12538795,
      densitate_capital: 1.6372,
    },
  ],
  // PD calibration by decile: predicted vs. observed default rate
  calibration: [
    { decile: 1, pd_predicted: 0.021, default_actual: 0.018 },
    { decile: 2, pd_predicted: 0.034, default_actual: 0.031 },
    { decile: 3, pd_predicted: 0.045, default_actual: 0.049 },
    { decile: 4, pd_predicted: 0.057, default_actual: 0.052 },
    { decile: 5, pd_predicted: 0.068, default_actual: 0.074 },
    { decile: 6, pd_predicted: 0.079, default_actual: 0.071 },
    { decile: 7, pd_predicted: 0.091, default_actual: 0.098 },
    { decile: 8, pd_predicted: 0.104, default_actual: 0.096 },
    { decile: 9, pd_predicted: 0.122, default_actual: 0.131 },
    { decile: 10, pd_predicted: 0.156, default_actual: 0.149 },
  ],
};

const INK = '#1C1E20';
const INK_SOFT = '#5B5E62';
const LINE = '#D6D3CB';
const PAPER = '#F2F1ED';
const PANEL = '#FAFAF7';
const PRIMARY = '#1F3A5C';
const PRIMARY_SOFT = '#4A6785';
const OK = '#3D6B4E';
const WATCH = '#B8842E';
const BREACH = '#A6402F';

const mono: CSSProperties = {
  fontFamily: "'IBM Plex Mono', 'Roboto Mono', monospace",
};
const sans: CSSProperties = {
  fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
};

function fmtUsd(n: number, compact = true): string {
  if (compact) {
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  }
  return `$${n.toLocaleString('en-US')}`;
}
function fmtPct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}
function densityColor(d: number): string {
  if (d < 0.6) return OK;
  if (d < 1.0) return WATCH;
  return BREACH;
}

interface KpiProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function Kpi({ label, value, sub, accent }: KpiProps) {
  return (
    <div
      style={{
        borderLeft: `3px solid ${accent || PRIMARY}`,
        padding: '14px 18px',
        background: PANEL,
      }}
    >
      <div style={{ ...sans, fontSize: 12, color: INK_SOFT, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ ...mono, fontSize: 26, color: INK, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ ...sans, fontSize: 11.5, color: INK_SOFT, marginTop: 5 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

interface SectionHeadingProps {
  title: string;
  note?: string;
}

function SectionHeading({ title, note }: SectionHeadingProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 14,
        paddingBottom: 8,
        borderBottom: `1px solid ${LINE}`,
      }}
    >
      <h2
        style={{
          ...sans,
          fontSize: 15,
          fontWeight: 600,
          color: INK,
          margin: 0,
        }}
      >
        {title}
      </h2>
      {note && (
        <span style={{ ...sans, fontSize: 12, color: INK_SOFT }}>{note}</span>
      )}
    </div>
  );
}

interface ChartTooltipProps<T> {
  active?: boolean;
  payload?: Array<{ payload: T }>;
}

function GradeTooltip({ active, payload }: ChartTooltipProps<GradeRow>) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        ...sans,
        background: '#fff',
        border: `1px solid ${LINE}`,
        padding: '10px 14px',
        fontSize: 12.5,
        color: INK,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Grade {d.grade}</div>
      <div style={mono}>PD mediu&nbsp;&nbsp;{fmtPct(d.PD_mediu, 2)}</div>
      <div style={mono}>
        LGD&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{fmtPct(d.LGD_grade, 1)}
      </div>
      <div style={mono}>Densitate&nbsp;{fmtPct(d.densitate_capital, 1)}</div>
      <div style={{ ...sans, color: INK_SOFT, marginTop: 4 }}>
        {d.n_credite.toLocaleString('en-US')} credite · EAD{' '}
        {fmtUsd(d.EAD_total)}
      </div>
    </div>
  );
}

function CalibrationTooltip({
  active,
  payload,
}: ChartTooltipProps<CalibrationPoint>) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        ...sans,
        background: '#fff',
        border: `1px solid ${LINE}`,
        padding: '10px 14px',
        fontSize: 12.5,
        color: INK,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Decila {d.decile}</div>
      <div style={mono}>Prezis&nbsp;&nbsp;{fmtPct(d.pd_predicted, 2)}</div>
      <div style={mono}>
        Real&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{fmtPct(d.default_actual, 2)}
      </div>
    </div>
  );
}

export default function CreditRiskDashboard() {
  const [data, setData] = useState<CreditRiskSummary>(MOCK_RESPONSE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const { portfolio, by_grade, calibration } = data;
  const maxCalib = Math.max(
    ...calibration.map((d) => Math.max(d.pd_predicted, d.default_actual)),
  );

  return (
    <div
      style={{
        ...sans,
        background: PAPER,
        color: INK,
        minHeight: '100%',
        padding: '28px 28px 40px',
      }}
    >
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 26,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div>
            <h1
              style={{ fontSize: 20, fontWeight: 600, margin: 0, color: INK }}
            >
              Credit Risk — Retail Loan Portfolio
            </h1>
            <div style={{ fontSize: 13, color: INK_SOFT, marginTop: 4 }}>
              PD (regresie logistică) · LGD empiric · IRB advanced RWA
            </div>
          </div>
          <div style={{ fontSize: 12, color: INK_SOFT, ...mono }}>
            {portfolio.n_loans.toLocaleString('en-US')} credite
            {loading ? ' · se actualizează…' : ''}
          </div>
        </div>

        {/* KPI row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 1,
            marginBottom: 30,
            background: LINE,
          }}
        >
          <Kpi
            label='EAD total'
            value={fmtUsd(portfolio.ead_total)}
            accent={PRIMARY}
          />
          <Kpi
            label='Expected Loss'
            value={fmtUsd(portfolio.el_total)}
            sub={`${fmtPct(portfolio.el_pct, 2)} din EAD`}
            accent={PRIMARY_SOFT}
          />
          <Kpi
            label='RWA total'
            value={fmtUsd(portfolio.rwa_total)}
            accent={PRIMARY}
          />
          <Kpi
            label='Densitate capital'
            value={fmtPct(portfolio.capital_density, 1)}
            sub='RWA / EAD'
            accent={densityColor(portfolio.capital_density)}
          />
        </div>

        {/* Grade breakdown */}
        <div style={{ marginBottom: 30 }}>
          <SectionHeading
            title='Risc pe grad de credit'
            note='PD crește A→G · LGD relativ constant ~90%'
          />
          <div
            style={{
              background: PANEL,
              border: `1px solid ${LINE}`,
              padding: '18px 18px 6px',
            }}
          >
            <ResponsiveContainer width='100%' height={220}>
              <BarChart
                data={by_grade}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke={LINE} vertical={false} />
                <XAxis
                  dataKey='grade'
                  tick={{
                    fill: INK_SOFT,
                    fontSize: 12,
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                  axisLine={{ stroke: LINE }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  tick={{
                    fill: INK_SOFT,
                    fontSize: 11,
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  content={<GradeTooltip />}
                  cursor={{ fill: 'rgba(31,58,92,0.06)' }}
                />
                <ReferenceLine
                  y={1.0}
                  stroke={INK_SOFT}
                  strokeDasharray='3 3'
                />
                <Bar dataKey='densitate_capital' barSize={34}>
                  {by_grade.map((d) => (
                    <Cell
                      key={d.grade}
                      fill={densityColor(d.densitate_capital)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div
              style={{
                display: 'flex',
                gap: 18,
                fontSize: 11.5,
                color: INK_SOFT,
                padding: '2px 4px 14px',
              }}
            >
              <LegendDot color={OK} label='densitate < 60%' />
              <LegendDot color={WATCH} label='60–100%' />
              <LegendDot color={BREACH} label='> 100%' />
            </div>
          </div>

          {/* Grade table */}
          <div
            style={{
              background: PANEL,
              border: `1px solid ${LINE}`,
              borderTop: 'none',
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 12.5,
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${LINE}` }}>
                  {[
                    'Grad',
                    'Credite',
                    'PD mediu',
                    'LGD',
                    'EAD',
                    'RWA',
                    'Densitate',
                  ].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        textAlign: i === 0 ? 'left' : 'right',
                        padding: '9px 14px',
                        fontWeight: 600,
                        color: INK_SOFT,
                        fontSize: 11.5,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={mono}>
                {by_grade.map((d) => (
                  <tr
                    key={d.grade}
                    style={{ borderBottom: `1px solid ${LINE}` }}
                  >
                    <td
                      style={{ padding: '8px 14px', ...sans, fontWeight: 600 }}
                    >
                      {d.grade}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                      {d.n_credite.toLocaleString('en-US')}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                      {fmtPct(d.PD_mediu, 2)}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                      {fmtPct(d.LGD_grade, 1)}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                      {fmtUsd(d.EAD_total)}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                      {fmtUsd(d.RWA_total)}
                    </td>
                    <td
                      style={{
                        padding: '8px 14px',
                        textAlign: 'right',
                        color: densityColor(d.densitate_capital),
                        fontWeight: 600,
                      }}
                    >
                      {fmtPct(d.densitate_capital, 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PD calibration */}
        <div>
          <SectionHeading
            title='Calibrare model PD'
            note='PD prezis vs. rata de default observată, pe decile'
          />
          <div
            style={{
              background: PANEL,
              border: `1px solid ${LINE}`,
              padding: 18,
            }}
          >
            <ResponsiveContainer width='100%' height={260}>
              <ScatterChart margin={{ top: 6, right: 12, left: 0, bottom: 6 }}>
                <CartesianGrid stroke={LINE} />
                <XAxis
                  type='number'
                  dataKey='pd_predicted'
                  name='PD prezis'
                  domain={[0, maxCalib * 1.1]}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  tick={{
                    fill: INK_SOFT,
                    fontSize: 11,
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                  axisLine={{ stroke: LINE }}
                  tickLine={false}
                  label={{
                    value: 'PD prezis',
                    position: 'insideBottom',
                    offset: -4,
                    fontSize: 11,
                    fill: INK_SOFT,
                  }}
                />
                <YAxis
                  type='number'
                  dataKey='default_actual'
                  name='rată reală'
                  domain={[0, maxCalib * 1.1]}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  tick={{
                    fill: INK_SOFT,
                    fontSize: 11,
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  content={<CalibrationTooltip />}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                {/* perfect-calibration reference: y = x */}
                <Scatter
                  data={[
                    { pd_predicted: 0, default_actual: 0 },
                    {
                      pd_predicted: maxCalib * 1.1,
                      default_actual: maxCalib * 1.1,
                    },
                  ]}
                  line={{ stroke: INK_SOFT, strokeDasharray: '4 3' }}
                  shape={() => null as unknown as ReactNode}
                  legendType='none'
                />
                <Scatter data={calibration} fill={PRIMARY} />
              </ScatterChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 2 }}>
              Linia punctată marchează calibrarea perfectă (PD prezis = rată
              observată).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LegendDotProps {
  color: string;
  label: string;
}

function LegendDot({ color, label }: LegendDotProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          background: color,
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  );
}
