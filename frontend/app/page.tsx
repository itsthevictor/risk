export default function Home() {
  return (
    <div className='relative flex flex-col flex-1 justify-center min-h-full p-4 overflow-hidden items-start'>
      {/* background layer — isolated so transform/opacity don't affect content */}
      <div className='absolute inset-0 -z-10 bg-background' />
      <div className='max-w-3xl mx-30 flex-col flex gap-y-4'>
        <h1 className='text-4xl font-bold mb-4'>Portofoliu analiză de risc</h1>
        <p className='text-lg text-muted-foreground'>
          Portofoliu live de instrumente de analiză de risc - Proiect personal
          Victor Alexa.
        </p>
        <p className='text-sm text-muted-foreground mt-2'>
          Acest proiect include instrumente pentru analiza riscului de
          lichiditate, riscului de piață și riscului de credit, și este
          construit folosind Python și Next.js.
        </p>
        <p className='text-sm text-muted-foreground mt-2'>
          Acest proiect este destinat exclusiv scopurilor educaționale și de
          cercetare. Nu oferă sfaturi financiare și nu ar trebui să fie utilizat
          pentru luarea deciziilor de investiții. Utilizarea acestui software se
          face pe propriul risc.
        </p>
        <p className='text-sm text-muted-foreground mt-2'>
          Pentru mai multe informații, vă rugăm să vizitați{' '}
          <a
            href='https://github.com/itsthevictor/risk'
            className='hover:underline hover:text-foreground'
          >
            repository-ul GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
