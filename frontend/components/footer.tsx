const Footer = () => {
  return (
    <div className='text-sm text-muted-foreground pt-2 pb-5 flex flex-row items-start justify-center gap-x-20 bg-transparent border-t border-gray-200'>
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
