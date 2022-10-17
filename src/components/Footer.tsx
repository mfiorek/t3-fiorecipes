import React from 'react';

const Footer = () => {
  return (
    <div className='flex flex-wrap justify-center gap-x-2 bg-zinc-300 p-2 text-sm text-zinc-800 shadow'>
      <p className='text-center'>Made for friends 💙</p>
      <p className='text-center'>
        by <a href='https://mfiorek.github.io/'>Marcin Fiorek Codes</a> 🥦
      </p>
      <p className='text-center'>
        Source code: <a href='https://github.com/mfiorek/t3-fiorecipes'>github</a> ⌨
      </p>
    </div>
  );
};

export default Footer;
