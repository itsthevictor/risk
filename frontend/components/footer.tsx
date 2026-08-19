import { ThemeToggle } from '@/components/theme-toggle';
const Footer = () => {
  return (
    <footer className='text-xs text-muted-foreground py-3 md:flex flex-row items-center justify-between gap-y-2  bg-transparent border-t border-muted-foreground hidden px-4'>
      <ThemeToggle />
      <div className='flex flex-row gap-x-10'>
        <a
          href='https://github.com/itsthevictor/risk'
          className='hover:underline hover:text-foreground'
          target='_blank'
          rel='noopener noreferrer'
        >
          GitHub
        </a>
        <a
          href='https://www.linkedin.com/in/victor-alexa/'
          className='hover:underline hover:text-foreground'
          target='_blank'
          rel='noopener noreferrer'
        >
          LinkedIn
        </a>
        <a
          href='/path/to/cv.pdf'
          className='hover:underline hover:text-foreground'
          target='_blank'
          rel='noopener noreferrer'
        >
          Curriculum Vitae
        </a>
      </div>
    </footer>
  );
};
export default Footer;
