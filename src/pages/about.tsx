import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '../components/Button';
import FiorecipesHead from '../components/FiorecipesHead';

const AboutPage = () => {
  return (
    <>
      <FiorecipesHead />
      <div className='flex h-screen flex-col items-center justify-center bg-zinc-700'>
        <h1 className='text-7xl font-extrabold text-zinc-200'>About fiorecipes</h1>
        <Image src='/fiorecipes-logo.svg' alt='logo' className='' width={180} height={180} />
        <Link href='/login' passHref>
          <Button>Log in</Button>
        </Link>
      </div>
    </>
  );
};

export default AboutPage;
