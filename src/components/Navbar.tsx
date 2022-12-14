import React, { Fragment, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useSetAtom } from 'jotai';
import { searchAtom } from '../state/atoms';
import { Popover, Transition } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';
import Button from './Button';

const Navbar = () => {
  const { data: session } = useSession();
  const [isDisabled, setIsDisabled] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchingInput, setSearchingInput] = useState('');
  const setSearch = useSetAtom(searchAtom);

  return (
    <div className='sticky top-0 z-30 w-full bg-zinc-400  shadow-lg'>
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
        <div className='flex items-center gap-2'>
          <div className={`mx-auto hidden items-center justify-between overflow-hidden transition-all duration-300 lg:inline-block ${!isSearching && '-translate-y-[200%]'}`}>
            <input
              type='text'
              className='w-full rounded-full border border-zinc-600 bg-zinc-200 py-1 px-4 focus:bg-white focus-visible:outline-none'
              onChange={(e) => {
                setSearch(e.target.value.split(' ').filter((word) => !!word.length));
                setSearchingInput(e.target.value);
              }}
              value={searchingInput}
              placeholder='Search...'
            />
          </div>
          <button
            onClick={() => {
              setIsSearching(!isSearching);
              setSearch(['']);
              setSearchingInput('');
            }}
          >
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='h-5 w-5'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' />
            </svg>
          </button>
          <Popover className='relative'>
            <>
              <Popover.Button
                className='inline-flex items-center gap-2 rounded-md px-3 py-2
                  hover:bg-black hover:bg-opacity-20 hover:text-opacity-100
                  focus:outline-none focus-visible:bg-black focus-visible:bg-opacity-20
                  active:scale-95'
              >
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' className='inline-block h-5 w-5 stroke-zinc-800'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16M4 18h16'></path>
                </svg>
                <span className='font-semibold text-zinc-800'>Menu</span>
              </Popover.Button>
              <Transition
                as={Fragment}
                enter='transition ease-out duration-200'
                enterFrom='opacity-0 translate-y-1'
                enterTo='opacity-100 translate-y-0'
                leave='transition ease-in duration-150'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 translate-y-1'
              >
                <Popover.Panel className='absolute right-0 z-10 mt-1 min-w-[12rem]'>
                  <div className='overflow-hidden rounded-lg bg-zinc-200 shadow-lg ring-1 ring-black ring-opacity-5'>
                    {session?.user && (
                      <section className='flex items-center gap-2 p-2'>
                        <div className='relative h-10 w-10 overflow-hidden rounded-full border bg-zinc-400'>
                          {session.user.image ? (
                            <Image src={session.user.image} alt='user pic' layout='fill' />
                          ) : (
                            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' className='h-full w-full pt-2' stroke='currentColor' fill='#1e293b'>
                              <path d='M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z' />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className='leading-5'>{session.user.name}</h3>
                          <h4 className='text-sm leading-4'>{session.user.email}</h4>
                        </div>
                      </section>
                    )}
                    <section className='flex flex-col items-start border-t border-zinc-300 p-1'>
                      <Link href='/recipes/add' passHref>
                        <button className='w-full rounded px-3 py-1.5 text-left hover:bg-zinc-600 hover:bg-opacity-25'>Add new recipe</button>
                      </Link>
                      <Link href='/ingredients' passHref>
                        <button className='w-full rounded px-3 py-1.5 text-left hover:bg-zinc-600 hover:bg-opacity-25'>My ingredients</button>
                      </Link>
                      <Link href='/tags' passHref>
                        <button className='w-full rounded px-3 py-1.5 text-left hover:bg-zinc-600 hover:bg-opacity-25'>My tags</button>
                      </Link>
                      <Link href='/about' passHref>
                        <button className='w-full rounded px-3 py-1.5 text-left hover:bg-zinc-600 hover:bg-opacity-25'>About</button>
                      </Link>
                    </section>
                    <section className='flex flex-col items-start border-t border-zinc-300 p-1'>
                      <button
                        className='flex w-full items-center gap-2 rounded px-3 py-1.5
                              hover:bg-red-500 hover:bg-opacity-50
                              disabled:cursor-not-allowed disabled:opacity-20'
                        disabled={isDisabled}
                        onClick={() => {
                          setIsDisabled(true);
                          signOut();
                        }}
                      >
                        <span>Logout</span>
                        {isDisabled && (
                          <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 animate-spin' viewBox='0 0 24 24' stroke='currentColor' fill='currentColor'>
                            <path d='M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z' />
                          </svg>
                        )}
                      </button>
                    </section>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          </Popover>
        </div>
      </div>
      <div className={`mx-auto items-center justify-between overflow-hidden px-4 transition-all duration-300 lg:hidden ${isSearching ? 'h-10' : 'h-0'}`}>
        <input
          type='text'
          className='w-full rounded-full border border-zinc-600 bg-zinc-200 py-1 px-4 focus:bg-white focus-visible:outline-none'
          onChange={(e) => {
            setSearch(e.target.value.split(' ').filter((word) => !!word.length));
            setSearchingInput(e.target.value);
          }}
          value={searchingInput}
          placeholder='Search...'
        />
      </div>
    </div>
  );
};

export default Navbar;
