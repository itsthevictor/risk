import { Badge } from '@/components/ui/badge';
import { IconArrowUpRight } from '@tabler/icons-react';
import Link from '@/components/locale-link';
import { getDictionary } from '@/lib/i18n/dictionaries';

export default async function Home() {
  const { home, nav } = await getDictionary();

  return (
    <div className='relative flex flex-col flex-1 justify-center min-h-full p-4 overflow-hidden items-start'>
      <div className='max-w-3xl md:mx-45 sm:mx-0 flex-col flex gap-y-4'>
        <h1 className='text-4xl font-bold mb-4'>{home.title}</h1>
        <p className='text-lg uppercase text-red-600 dark:text-red-400 font-medium'>
          {home.disclaimer}
        </p>
        <p className='text-sm text-foreground mt-2'>{home.intro}</p>
        <p className='text-xs text-muted-foreground mt-2'>
          {home.note}{' '}
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
            className='group flex items-center hover:text-foreground hover:underline'
          >
            {nav.market} <IconArrowUpRight size={16} className='ml-1 ' />
          </Link>
          {/* </Button> */}

          <div className='flex items-center gap-2'>
            {home.market.badges.map((badge) => (
              <Badge key={badge} variant='secondary'>
                {badge}
              </Badge>
            ))}
          </div>
          <span className='text-xs text-muted-foreground bg-transparent italic'>
            {home.market.source}
          </span>
        </div>
        <div className='flex flex-col gap-y-2'>
          {/* <Button variant='ghost' className='w-fit'> */}
          <Link
            href='/liquidity'
            data-umami-event='homepage-liquidity-link'
            className='hover:underline hover:text-foreground  flex items-center'
          >
            {nav.liquidity} <IconArrowUpRight size={16} className='ml-1' />
          </Link>
          {/* </Button> */}

          {/* <Badge variant='secondary'>HQLA · Ieșiri nete · LCR</Badge> */}
          <div className='flex items-center gap-2'>
            {home.liquidity.badges.map((badge) => (
              <Badge key={badge} variant='secondary'>
                {badge}
              </Badge>
            ))}
          </div>
          <span className='text-xs text-muted-foreground bg-transparent italic'>
            {home.liquidity.source}
          </span>
        </div>
        <div className='flex flex-col gap-y-2'>
          {/* <Button variant='ghost' className='w-fit'> */}
          <Link
            href='/interest-rate'
            data-umami-event='homepage-interest-rate-link'
            className='hover:underline hover:text-foreground  flex items-center'
          >
            {nav.interestRate} <IconArrowUpRight size={16} className='ml-1' />
          </Link>
          {/* </Button> */}

          <div className='flex items-center gap-2'>
            {home.interestRate.badges.map((badge) => (
              <Badge key={badge} variant='secondary'>
                {badge}
              </Badge>
            ))}
          </div>
          <span className='text-xs text-muted-foreground bg-transparent italic'>
            {home.interestRate.source}
          </span>
        </div>
        <div className='flex flex-col gap-y-2'>
          {/* <Button variant='ghost' className='w-fit'> */}
          <Link
            href='/credit'
            data-umami-event='homepage-credit-link'
            className='hover:underline hover:text-foreground  flex items-center'
          >
            {nav.credit} <IconArrowUpRight size={16} className='ml-1' />
          </Link>
          {/* </Button> */}

          <div className='flex items-center gap-2'>
            {home.credit.badges.map((badge) => (
              <Badge key={badge} variant='secondary'>
                {badge}
              </Badge>
            ))}
          </div>
          <span className='text-xs text-muted-foreground bg-transparent italic'>
            {home.credit.source}
          </span>
        </div>
      </div>
    </div>
  );
}
