'use client';

import Link from 'next/link';
import {
  IconArrowUpRight,
  IconChartBar,
  IconBuildingBank,
  IconDatabase,
  IconMapPin,
  IconShieldCheck,
  IconTrendingDown,
  IconWallet,
  IconMail,
  IconPhone,
  IconBrandLinkedin,
  IconDownload,
} from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const riskProjects = [
  {
    title: 'Risc de piață',
    href: '/market',
    icon: IconTrendingDown,
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
    title: 'Risc de lichiditate',
    href: '/liquidity',
    icon: IconWallet,
    description:
      'Evaluarea poziției de lichiditate și calcularea indicatorilor utilizați pentru monitorizarea riscului.',
    metrics: ['LCR', 'HQLA', 'Ieșiri nete de numerar'],
    source: 'Model de analiză',
  },
  {
    title: 'Risc de dobândă',
    href: '/interest-rate',
    icon: IconChartBar,
    description:
      'Analiza sensibilității bilanțului la modificarea ratelor de dobândă și evaluarea impactului asupra valorii economice și venitului net din dobânzi.',
    metrics: ['EVE', 'NII', 'Șocuri de dobândă'],
    source: 'Date de simulare',
  },
  {
    title: 'Risc de credit',
    href: '/credit',
    icon: IconBuildingBank,
    description:
      'Modelarea riscului de credit pe baza unui set de date de împrumuturi și estimarea parametrilor principali ai pierderii de credit.',
    metrics: ['PD', 'LGD', 'EAD', 'EL', 'RWA'],
    source: 'Lending Club 2007–2018 · Kaggle',
  },
];

const experience = [
  {
    period: '2021 — prezent',
    role: 'Fondator · Product Manager · Web Developer',
    company: 'ONCA Digital Works',
    description:
      'Lucrez end-to-end la produse digitale și aplicații web, de la definirea problemei și modelarea fluxurilor până la dezvoltare, implementare și îmbunătățire continuă.',
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
      'Product Management în zona B2B, cu focus pe analiză de performanță, optimizarea proceselor comerciale și colaborarea dintre business, sales și technology.',
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
      'Am dezvoltat și ajustat strategia comercială pentru atât pentru Anticafe, cât și pentru editură.',
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
];

const education = [
  {
    period: '2026 — Present',
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
    title: 'Litere și Lingvistică · Română și Engleză',
    institution: 'Universitatea din București',
  },
];

const certifications = [
  'Bayesian Statistics — From Theory to Practice · Columbia University / Coursera',
  'Agent de Servicii de Investiții financiare · ASF România',
  'Performance Management',
  'Gemba Kaizen — Organizational Management',
  'Fundamentals of Digital Marketing · Google',
];

const technologies = [
  'Python',
  'SQL',
  'R',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Excel',
  'Tableau',
  'Google Sheets',
  'Git',
];

export default function Page() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <main className='min-h-screen bg-background text-foreground'>
      <div className='hidden px-6 pt-2 print:block print:px-0 print:pt-0'>
        <h1 className='text-3xl font-semibold tracking-tight'>Victor Alexa</h1>
        <p className='mt-1 whitespace-nowrap text-sm text-muted-foreground'>
          Risk Management · Finance · Data
        </p>
        <div className='mt-3 flex flex-col gap-1 text-sm text-muted-foreground'>
          <span>Bucharest, România</span>
          <a href='tel:+40747937967' data-umami-event='cv-phone-header-link'>
            +40747937967
          </a>
          <a
            href='mailto:victor.d.alexa@gmail.com'
            data-umami-event='cv-email-header-link'
          >
            victor.d.alexa@gmail.com
          </a>
          <a
            href='https://www.linkedin.com/in/victor-alexa/'
            data-umami-event='cv-linkedin-header-link'
          >
            linkedin.com/in/victor-alexa
          </a>
        </div>
      </div>

      <div className='mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-8 print:block print:px-0 print:py-0 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-10'>
        {/* Sidebar */}
        <aside className='print:hidden lg:sticky lg:top-8 lg:h-fit'>
          <div className='flex flex-col gap-6'>
            <div>
              {/* <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-xl border bg-muted text-sm font-semibold'>
                VA
              </div> */}

              <h1 className='text-xl font-semibold tracking-tight'>
                Victor Alexa
              </h1>

              <p className='mt-1 text-sm text-muted-foreground'>
                Risk Management · Finance · Data
              </p>
            </div>

            <div className='space-y-2 text-sm text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <IconMapPin className='h-4 w-4' />
                Bucharest, România
              </div>

              <a
                href='tel:+40747937967'
                className='flex items-center gap-2 transition-colors hover:text-foreground'
                data-umami-event='cv-phone-btn'
              >
                <IconPhone className='h-4 w-4' />
                +40 747.937.967
              </a>

              <a
                href='mailto:victor.d.alexa@gmail.com'
                className='flex items-center gap-2 transition-colors hover:text-foreground'
                data-umami-event='cv-email-btn'
              >
                <IconMail className='h-4 w-4' />
                Email
              </a>

              <a
                href='https://www.linkedin.com/in/victor-alexa/'
                target='_blank'
                rel='noreferrer'
                className='flex items-center gap-2 transition-colors hover:text-foreground'
                data-umami-event='cv-linkedin-btn'
              >
                <IconBrandLinkedin className='h-4 w-4' />
                LinkedIn
              </a>
            </div>

            <Separator />

            <nav className='hidden space-y-2 text-sm lg:block'>
              <a
                href='#about'
                className='block py-1 text-muted-foreground hover:text-foreground'
              >
                Profil
              </a>
              <a
                href='#portfolio'
                className='block py-1 text-muted-foreground hover:text-foreground'
              >
                Portofoliu risc
              </a>
              <a
                href='#experience'
                className='block py-1 text-muted-foreground hover:text-foreground'
              >
                Experiență
              </a>
              <a
                href='#education'
                className='block py-1 text-muted-foreground hover:text-foreground'
              >
                Educație
              </a>
              <a
                href='#skills'
                className='block py-1 text-muted-foreground hover:text-foreground'
              >
                Competențe
              </a>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className='min-w-0'>
          {/* Hero */}
          <section id='about' className='border-b pb-12 print:py-10'>
            <div className='max-w-4xl'>
              <Badge variant='secondary' className='mb-5 print:hidden'>
                Banking · Risk Management · Quantitative Analysis
              </Badge>

              <h2 className='text-4xl font-semibold tracking-tight sm:text-5xl print:text-2xl'>
                Construiesc produse și analize bazate pe date, cu focus pe
                managementul riscului financiar.
              </h2>

              <p className='mt-6 max-w-3xl text-lg leading-8 text-muted-foreground'>
                Profesionist cu peste 10 ani de experiență în strategie,
                analiză, management de produs și dezvoltare de aplicații.
                Formarea mea academică în Finanțe,Asigurări, Bănci și Burse de
                Valori, combinată cu experiența în data analysis, reporting și
                automatizarea proceselor, stă la baza tranziției mele către Risk
                Management bancar.
              </p>

              <div className='mt-7 flex flex-wrap gap-3 print:hidden'>
                <Button
                  nativeButton={false}
                  render={
                    <Link href='/' data-umami-event='cv-portfolio-link' />
                  }
                >
                  Vezi portofoliul de risc
                  <IconArrowUpRight className='ml-2 h-4 w-4' />
                </Button>

                <Button
                  variant='outline'
                  nativeButton={false}
                  render={<a href='mailto:victor.d.alexa@gmail.com' />}
                  data-umami-event='cv-email-btn'
                >
                  Contact
                  <IconMail className='ml-2 h-4 w-4' />
                </Button>

                <Button
                  variant='outline'
                  onClick={handlePrint}
                  data-umami-event='cv-download-btn'
                >
                  Descarcă CV-ul
                  <IconDownload className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </div>
          </section>

          {/* Portfolio */}
          <section id='portfolio' className='py-12 print:hidden'>
            <div className='mb-8 flex items-end justify-between gap-6'>
              <div>
                <p className='mb-2 text-sm font-medium text-muted-foreground'>
                  PROIECT PORTOFOLIU
                </p>

                <h2 className='text-2xl font-semibold tracking-tight'>
                  Analiză de risc bancar
                </h2>

                <p className='mt-2 max-w-2xl text-sm leading-6 text-muted-foreground'>
                  Portofoliu tehnic construit în Python și Next.js, orientat
                  spre aplicarea practică a conceptelor de risk management.
                </p>
              </div>

              <IconShieldCheck className='hidden h-8 w-8 text-muted-foreground sm:block' />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              {riskProjects.map((project) => {
                const Icon = project.icon;

                return (
                  <Link
                    key={project.href}
                    href={project.href}
                    className='group'
                    data-umami-event={`cv-${project.href}-link`}
                  >
                    <Card className='h-full transition-colors hover:border-foreground/30'>
                      <CardHeader>
                        <div className='mb-4 flex items-center justify-between'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
                            <Icon className='h-5 w-5' />
                          </div>

                          <IconArrowUpRight className='h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
                        </div>

                        <CardTitle className='text-lg'>
                          {project.title}
                        </CardTitle>

                        <p className='text-sm leading-6 text-muted-foreground'>
                          {project.description}
                        </p>
                      </CardHeader>

                      <CardContent>
                        <div className='flex flex-wrap gap-2'>
                          {project.metrics.map((metric) => (
                            <Badge
                              key={metric}
                              variant='outline'
                              className='font-normal'
                            >
                              {metric}
                            </Badge>
                          ))}
                        </div>

                        <p className='mt-4 text-xs text-muted-foreground'>
                          {project.source}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* Technical focus */}
          <section className='py-12 print:hidden'>
            <div className='grid gap-8 md:grid-cols-3'>
              <div>
                <IconDatabase className='mb-4 h-5 w-5' />

                <h3 className='font-semibold'>Data & Analytics</h3>

                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                  Lucru cu date financiare, modele statistice, indicatori de
                  risc, reporting și dashboard-uri.
                </p>
              </div>

              <div>
                <IconChartBar className='mb-4 h-5 w-5' />

                <h3 className='font-semibold'>Risk Analysis</h3>

                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                  Market Risk, Liquidity Risk, Interest Rate Risk și Credit
                  Risk, cu accent pe măsurare, modelare și interpretarea
                  rezultatelor.
                </p>
              </div>

              <div>
                <IconShieldCheck className='mb-4 h-5 w-5' />

                <h3 className='font-semibold'>Engineering</h3>

                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                  Transformarea analizelor în instrumente interactive și
                  reproductibile folosind Python, SQL și tehnologii web moderne.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Experience */}
          <section id='experience' className='py-12 print:py-6'>
            <div className='mb-8'>
              {/* <p className='mb-2 text-sm font-medium text-muted-foreground'>
                EXPERIENCE
              </p> */}

              <h2 className='text-2xl font-semibold tracking-tight'>
                Experiență profesională
              </h2>
            </div>

            <div className='space-y-10'>
              {experience.map((item) => (
                <article
                  key={`${item.company}-${item.period}`}
                  className='grid gap-3 md:grid-cols-[150px_minmax(0,1fr)]'
                >
                  <div className='text-sm text-muted-foreground'>
                    {item.period}
                  </div>

                  <div>
                    <h3 className='font-semibold'>{item.role}</h3>

                    <p className='mt-1 text-sm font-medium'>{item.company}</p>

                    <p className='mt-3 max-w-3xl text-sm leading-7 text-muted-foreground'>
                      {item.description}
                    </p>

                    <ul className='mt-4 max-w-3xl list-disc space-y-2 pl-5'>
                      {item.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className='text-sm leading-6 text-muted-foreground marker:text-foreground'
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>

                    <div className='mt-4 flex flex-wrap gap-2'>
                      {item.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant='secondary'
                          className='font-normal'
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <Separator />

          {/* Education + Certifications */}
          <section id='education' className='grid gap-12 py-12 md:grid-cols-2'>
            <div>
              {/* <p className='mb-2 text-sm font-medium text-muted-foreground'>
                EDUCATION
              </p> */}

              <h2 className='mb-7 text-2xl font-semibold tracking-tight'>
                Educație
              </h2>

              <div className='space-y-7'>
                {education.map((item) => (
                  <div key={item.title}>
                    <p className='text-sm text-muted-foreground'>
                      {item.period}
                    </p>

                    <h3 className='mt-1 font-semibold'>{item.title}</h3>

                    <p className='mt-1 text-sm text-muted-foreground'>
                      {item.institution}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {/* <p className='mb-2 text-sm font-medium text-muted-foreground'>
                CERTIFICATIONS
              </p> */}

              <h2 className='mb-7 text-2xl font-semibold tracking-tight'>
                Cursuri & certificări
              </h2>

              <div className='space-y-3'>
                {certifications.map((item) => (
                  <div
                    key={item}
                    className='rounded-lg border bg-muted/30 p-3 text-sm leading-6'
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Separator />

          {/* Skills */}
          <section id='skills' className='py-12'>
            <div className='mb-7'>
              {/* <p className='mb-2 text-sm font-medium text-muted-foreground'>
                TECHNOLOGY
              </p> */}

              <h2 className='text-2xl font-semibold tracking-tight'>
                Stack tehnic
              </h2>
            </div>

            <div className='flex flex-wrap gap-2'>
              {technologies.map((technology) => (
                <Badge
                  key={technology}
                  variant='outline'
                  className='px-3 py-1.5 text-sm font-normal'
                >
                  {technology}
                </Badge>
              ))}
            </div>
          </section>

          <Separator />

          {/* Footer */}
          <footer className='flex flex-col gap-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <span className='font-medium text-foreground'>Victor Alexa</span>
              <span className='mx-2'>·</span>
              Risk Management Portfolio
            </div>

            <div className='flex items-center gap-4'>
              <a
                href='mailto:victor.d.alexa@gmail.com'
                className='hover:text-foreground'
                data-umami-event='cv-footer-email-btn'
              >
                <IconMail className='h-4 w-4' />
                <span className='sr-only'>Email</span>
              </a>

              <a
                href='https://www.linkedin.com/in/victor-alexa/'
                target='_blank'
                rel='noreferrer'
                className='hover:text-foreground'
                data-umami-event='cv-footer-linkedin-btn'
              >
                <IconBrandLinkedin className='h-4 w-4' />
                <span className='sr-only'>LinkedIn</span>
              </a>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
