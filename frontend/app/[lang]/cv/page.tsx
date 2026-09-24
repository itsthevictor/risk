'use client';

import Link from '@/components/locale-link';
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
import { useLocale } from '@/providers/i18n-provider';
import { cvContent } from './content';

const projectIcons: Record<string, typeof IconChartBar> = {
  '/market': IconTrendingDown,
  '/liquidity': IconWallet,
  '/interest-rate': IconChartBar,
  '/credit': IconBuildingBank,
};

const focusIcons = [IconDatabase, IconChartBar, IconShieldCheck];

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
  const t = cvContent[useLocale()];
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
          <span>{t.location}</span>
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
                {t.location}
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
                {t.nav.about}
              </a>
              <a
                href='#portfolio'
                className='block py-1 text-muted-foreground hover:text-foreground'
              >
                {t.nav.portfolio}
              </a>
              <a
                href='#experience'
                className='block py-1 text-muted-foreground hover:text-foreground'
              >
                {t.nav.experience}
              </a>
              <a
                href='#education'
                className='block py-1 text-muted-foreground hover:text-foreground'
              >
                {t.nav.education}
              </a>
              <a
                href='#skills'
                className='block py-1 text-muted-foreground hover:text-foreground'
              >
                {t.nav.skills}
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
                {t.hero.badge}
              </Badge>

              <h2 className='text-4xl font-semibold tracking-tight sm:text-5xl print:text-2xl'>
                {t.hero.title}
              </h2>

              <p className='mt-6 max-w-3xl text-lg leading-8 text-muted-foreground'>
                {t.hero.intro}
              </p>

              <div className='mt-7 flex flex-wrap gap-3 print:hidden'>
                <Button
                  nativeButton={false}
                  render={
                    <Link href='/' data-umami-event='cv-portfolio-link' />
                  }
                >
                  {t.hero.portfolioButton}
                  <IconArrowUpRight className='ml-2 h-4 w-4' />
                </Button>

                <Button
                  variant='outline'
                  nativeButton={false}
                  render={<a href='mailto:victor.d.alexa@gmail.com' />}
                  data-umami-event='cv-email-btn'
                >
                  {t.hero.contactButton}
                  <IconMail className='ml-2 h-4 w-4' />
                </Button>

                <Button
                  variant='outline'
                  onClick={handlePrint}
                  data-umami-event='cv-download-btn'
                >
                  {t.hero.downloadButton}
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
                  {t.portfolio.eyebrow}
                </p>

                <h2 className='text-2xl font-semibold tracking-tight'>
                  {t.portfolio.title}
                </h2>

                <p className='mt-2 max-w-2xl text-sm leading-6 text-muted-foreground'>
                  {t.portfolio.description}
                </p>
              </div>

              <IconShieldCheck className='hidden h-8 w-8 text-muted-foreground sm:block' />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              {t.portfolio.projects.map((project) => {
                const Icon = projectIcons[project.href];

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
              {t.focus.map((item, i) => {
                const Icon = focusIcons[i];

                return (
                  <div key={item.title}>
                    <Icon className='mb-4 h-5 w-5' />

                    <h3 className='font-semibold'>{item.title}</h3>

                    <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                      {item.description}
                    </p>
                  </div>
                );
              })}
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
                {t.experienceTitle}
              </h2>
            </div>

            <div className='space-y-10'>
              {t.experience.map((item) => (
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
                {t.educationTitle}
              </h2>

              <div className='space-y-7'>
                {t.education.map((item) => (
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
                {t.certificationsTitle}
              </h2>

              <div className='space-y-3'>
                {t.certifications.map((item) => (
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
                {t.stackTitle}
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
              {t.footerTagline}
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
