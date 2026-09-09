import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='relative flex flex-col flex-1 justify-center min-h-full p-4 overflow-hidden items-start'>
      {/* background layer — isolated so transform/opacity don't affect content */}
      <div className='absolute inset-0 -z-10 bg-background' />
      <div className='max-w-3xl md:mx-30 sm:mx-0 flex-col flex gap-y-4'>
        <h1 className='text-4xl font-bold mb-4'>Portofoliu analiză de risc</h1>
        <p className='text-lg uppercase text-red-600 dark:text-red-400 font-medium'>
          Portofoliu de instrumente de analiză de risc - Proiect personal Victor
          Alexa. Produs nedestinat pentru uz comercial.
        </p>
        <p className='text-sm text-foreground mt-2'>
          Acest portofoliu cuprinde instrumente bazate pe tehnicile fundamentale
          de analiză a riscului de lichiditate, riscului de piață și riscului de
          credit și a fost construit folosind Python și Next.js.
        </p>
        <p className='text-xs text-muted-foreground mt-2'>
          Acest proiect este destinat exclusiv scopurilor educaționale și de
          cercetare. Nu oferă sfaturi financiare și nu ar trebui să fie utilizat
          pentru luarea deciziilor de investiții. Utilizarea acestui software se
          face pe propriul risc.
        </p>
        <p className='text-xs text-muted-foreground mt-2'>
          Pentru mai multe informații, vă rugăm să vizitați{' '}
          <a
            href='https://github.com/itsthevictor/risk'
            className='hover:underline hover:text-foreground'
            data-umami-event='homepage-github-link'
            target='_blank'
            rel='noopener noreferrer'
          >
            repository-ul GitHub
          </a>
        </p>
        <div className='md:flex md:flex-row flex flex-col max-w-3xl gap-x-4 gap-y-2 mt-4'>
          <Button variant='outline' className='w-fit'>
            <Link href='/market' data-umami-event='homepage-market-link'>
              Risc de piață
            </Link>
          </Button>
          <Button variant='outline' className=' w-fit'>
            <Link href='/liquidity' data-umami-event='homepage-liquidity-link'>
              Risc de lichiditate
            </Link>
          </Button>
          <Button variant='outline' className=' w-fit'>
            <Link href='/interest-rate'>Risc de dobândă</Link>
          </Button>
          <Button variant='outline' className='w-fit'>
            <Link href='/credit' data-umami-event='homepage-credit-link'>
              Risc de credit
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
