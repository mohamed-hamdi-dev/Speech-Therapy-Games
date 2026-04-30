import React from 'react';

const Button = ({ children, variant = 'primary', onClick, className = '', disabled = false }) => {
  const baseStyle = "flex items-center justify-center gap-2";
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "bg-green-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:bg-green-600 hover:-translate-y-1 transition-all duration-300 active:scale-95 border-none",
    outline: "btn-outline"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
