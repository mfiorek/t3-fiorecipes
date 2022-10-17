import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from './Button';
import { signOut, useSession } from 'next-auth/react';
import classNames from 'classnames';

const Navbar = () => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const menuClass = classNames({ 'scale-0 opacity-0': !menuOpen, 'scale-100 opacity-100': menuOpen });

  return (
    <div className='sticky top-0 w-full bg-zinc-400 shadow-lg'>
      <div className='mx-auto flex items-center justify-between px-4 py-2 lg:max-w-[64rem]'>
        <Link href='/recipes' passHref>
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
          <Link href='/recipes/add' passHref>
            <Button>Add recipe</Button>
          </Link>
          {session?.user && (
            <div className='relative' tabIndex={0} onFocus={() => setMenuOpen(true)} onBlur={() => setMenuOpen(false)}>
              <div className='relative h-10 w-10 cursor-pointer overflow-hidden rounded-full border bg-zinc-400'>
                {session.user.image ? (
                  <Image src={session.user.image} alt='user pic' layout='fill' />
                ) : (
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' className='h-full w-full pt-2' stroke='currentColor' fill='#1e293b'>
                    <path d='M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z' />
                  </svg>
                )}
              </div>
              <div
                className={`absolute top-full right-0 z-20 mt-1 flex origin-top-right transform flex-col gap-2 rounded bg-zinc-400 border border-zinc-800 p-2 transition duration-200 ease-in-out ${menuClass}`}
              >
                <div>
                  <h3>{session.user.name}</h3>
                  <h4 className='text-sm'>{session.user.email}</h4>
                </div>
                <hr className='border-zinc-800' />
                <button
                  className='flex w-full items-center justify-center gap-2 bg-red-500 p-1 disabled:cursor-not-allowed disabled:opacity-20'
                  disabled={isDisabled}
                  onClick={() => {
                    setIsDisabled(true);
                    signOut();
                    setMenuOpen(true);
                  }}
                >
                  <p>Logout</p>
                  {isDisabled && (
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 animate-spin' viewBox='0 0 24 24' stroke='currentColor' fill='currentColor'>
                      <path d='M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z' />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
