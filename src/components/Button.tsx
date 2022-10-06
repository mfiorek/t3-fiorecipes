import React from 'react';

interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className='rounded py-1.5 px-3 font-semibold transition-all
        hover:bg-zinc-300 hover:bg-opacity-50
        active:focus:bg-zinc-300 active:focus:bg-opacity-50 active:focus:scale-95'
    >
      {children}
    </button>
  );
};

export default Button;
