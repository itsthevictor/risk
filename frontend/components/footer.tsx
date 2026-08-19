const Footer = () => {
  return (
    <footer className='text-sm text-muted-foreground pt-2 pb-5 md:flex flex-col items-center justify-center gap-y-2 sm:gap-x-20 bg-transparent border-t border-gray-200 hidden'>
      <a
        href='https://github.com/itsthevictor/risk'
        className='hover:underline hover:text-foreground'
      >
        GitHub
      </a>
      <a
        href='https://www.linkedin.com/in/victor-alexa/'
        className='hover:underline hover:text-foreground'
      >
        LinkedIn
      </a>
      <a
        href='/path/to/cv.pdf'
        className='hover:underline hover:text-foreground'
      >
        CV
      </a>
    </footer>
  );
};
export default Footer;
