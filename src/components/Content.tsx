import React, { PropsWithChildren } from 'react';
import FiorecipesHead from './FiorecipesHead';
import Navbar from './Navbar';
import Footer from './Footer';

const Content: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <FiorecipesHead />
      <main className='flex min-h-screen flex-col bg-zinc-400 text-zinc-800'>
        <Navbar />
        <div className='mx-auto flex w-full max-w-5xl grow flex-col items-center bg-zinc-200 p-4 shadow-2xl'>{children}</div>
        <Footer />
      </main>
    </>
  );
};

export default Content;
