import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>fiorecipes</title>
        <meta name='description' content='fiorecipes - simple app to keep track of your recipes' />
      </Head>

      <main className='flex min-h-screen flex-col bg-zinc-700'>
        <div className='flex w-full grow flex-col items-center justify-center'>
          <h1 className='text-5xl font-extrabold text-zinc-200'>
            <p>fiorecipes</p>
          </h1>
          <Image src='/fiorecipes-logo.svg' alt='logo' className='' width={180} height={180} />
        </div>
      </main>
    </>
  );
};

export default Home;
