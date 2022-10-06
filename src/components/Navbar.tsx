import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Button from './Button';

const Navbar = () => {
  return (
    <div className='sticky top-0 w-full bg-zinc-400 shadow-lg'>
      <div className='mx-auto flex items-center justify-between px-4 py-2 lg:max-w-[64rem]'>
        <Link href='/'>
          <Button>
            <div className='flex items-center gap-2'>
              <div className='relative h-8 w-8'>
                <Image src='/fiorecipes-logo.svg' alt='logo' layout='fill' />
              </div>
              <p className='text-center text-xl font-extrabold'>fiorecipes</p>
            </div>
          </Button>
        </Link>
        <div className='flex items-center gap-3'>
          <Link href='/edit'>
            <Button>Add recipe</Button>
          </Link>
          <div className='relative h-10 w-10 cursor-pointer overflow-hidden rounded-full border bg-zinc-200'>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' className='h-full w-full pt-2' stroke='currentColor' fill='#27272a'>
              <path d='M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z' />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
