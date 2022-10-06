import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Navbar from '../components/Navbar';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>fiorecipes</title>
        <meta name='description' content='fiorecipes - simple app to keep track of your recipes' />
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
        <link rel='manifest' href='/site.webmanifest' />
        <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#3f6212' />
        <meta name='msapplication-TileColor' content='#e4e4e7' />
        <meta name='theme-color' content='#e4e4e7' />
      </Head>

      <main className='flex min-h-screen flex-col bg-zinc-400 text-zinc-800'>
        <Navbar />
        <div className='mx-auto flex w-full max-w-5xl grow flex-col items-center justify-center bg-zinc-200 shadow-2xl'>
          <h1 className='text-5xl font-extrabold'>fiorecipes</h1>
          <Image src='/fiorecipes-logo.svg' alt='logo' className='' width={180} height={180} />
        </div>
      </main>
    </>
  );
};

export default Home;
