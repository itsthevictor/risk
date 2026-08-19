const Footer = () => {
  return (
    <footer className='text-sm text-muted-foreground py-3 md:flex flex-row items-center justify-end gap-y-2 sm:gap-x-20 bg-transparent border-t border-gray-200 hidden'>
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
    </footer>
  );
};
export default Footer;
