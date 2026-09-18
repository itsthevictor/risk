import { Badge } from '@/components/ui/badge';
import { IconArrowUpRight } from '@tabler/icons-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='relative flex flex-col flex-1 justify-center min-h-full p-4 overflow-hidden items-start'>
      <div className='max-w-3xl md:mx-45 sm:mx-0 flex-col flex gap-y-4'>
        <h1 className='text-4xl font-bold mb-4'>Portofoliu analiză de risc</h1>
        <p className='text-lg uppercase text-red-600 dark:text-red-400 font-medium'>
          Portofoliu de instrumente de analiză de risc - Proiect personal Victor
          Alexa, (DOFIN · 2026). Produs nedestinat pentru uz comercial.
        </p>
        <p className='text-sm text-foreground mt-2'>
          Acest portofoliu cuprinde instrumente bazate pe tehnicile fundamentale
          de analiză a riscului de lichiditate, riscului de piață și riscului de
          credit și a fost construit folosind Python și Next.js.
        </p>
        <p className='text-xs text-muted-foreground mt-2'>
          Proiect de portofoliu personal — nedestinat producției, raportării
          reglementare sau informării deciziilor de investiții. Pentru mai multe
          informații, vă rugăm să vizitați proiectul pe{' '}
          <a
            href='https://github.com/itsthevictor/risk'
            className='hover:underline hover:text-foreground underline'
            data-umami-event='homepage-github-link'
            target='_blank'
            rel='noopener noreferrer'
          >
            GitHub
          </a>
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2  gap-y-8 w-full  md:mx-45 sm:mx-0  max-w-5xl mt-12'>
        <div className='flex flex-col gap-y-2'>
          {/* <Button variant='ghost' className='w-fit'> */}
          <Link
            href='/market'
            data-umami-event='homepage-market-link'
            className='hover:underline hover:text-foreground  flex items-center'
          >
            Risc de piață <IconArrowUpRight size={16} className='ml-1' />
          </Link>
          {/* </Button> */}
          <span className='text-xs text-muted-foreground bg-transparent italic'>
            Date live din piață.
          </span>

          <Badge variant='secondary'>
            VaR · ES · Volatilitate · Backtesting · Stress Testing
          </Badge>
        </div>
        <div className='flex flex-col gap-y-2'>
          {/* <Button variant='ghost' className='w-fit'> */}
          <Link
            href='/liquidity'
            data-umami-event='homepage-liquidity-link'
            className='hover:underline hover:text-foreground  flex items-center'
          >
            Risc de lichiditate <IconArrowUpRight size={16} className='ml-1' />
          </Link>
          {/* </Button> */}
          <span className='text-xs text-muted-foreground bg-transparent italic'>
            Formular LCR
          </span>

          <Badge variant='secondary'>HQLA · Ieșiri nete · LCR</Badge>
        </div>
        <div className='flex flex-col gap-y-2'>
          {/* <Button variant='ghost' className='w-fit'> */}
          <Link
            href='/interest-rate'
            data-umami-event='homepage-interest-rate-link'
            className='hover:underline hover:text-foreground  flex items-center'
          >
            Risc de dobândă <IconArrowUpRight size={16} className='ml-1' />
          </Link>
          {/* </Button> */}
          <span className='text-xs text-muted-foreground bg-transparent italic'>
            Date mockup
          </span>

          <Badge variant='secondary'>EVE · NII · Șocuri de dobândă</Badge>
        </div>
        <div className='flex flex-col gap-y-2'>
          {/* <Button variant='ghost' className='w-fit'> */}
          <Link
            href='/credit'
            data-umami-event='homepage-credit-link'
            className='hover:underline hover:text-foreground  flex items-center'
          >
            Risc de credit <IconArrowUpRight size={16} className='ml-1' />
          </Link>
          {/* </Button> */}
          <span className='text-xs text-muted-foreground bg-transparent italic'>
            Dataset Lending Club 2007-2018 (Kaggle)
          </span>

          <Badge variant='secondary'>PD · LGD · EAD · EL · RWA</Badge>
        </div>
      </div>
    </div>
  );
}
