const Footer = () => {
  return (
    <div className='text-sm text-muted-foreground pt-2 pb-5 flex flex-col sm:flex-row items-center justify-center gap-y-2 sm:gap-x-20 bg-transparent border-t border-gray-200'>
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
    </div>
  );
};
export default Footer;
