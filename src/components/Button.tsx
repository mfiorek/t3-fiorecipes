import React from 'react';

interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      type='button'
      className='rounded py-1.5 px-3 font-semibold transition-all
        hover:bg-black hover:bg-opacity-20
        active:focus:bg-black active:focus:bg-opacity-20 active:focus:scale-95'
    >
      {children}
    </button>
  );
};

export default Button;
