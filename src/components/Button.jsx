import React from 'react';

export default function Button({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={
        `px-4 py-2 rounded font-medium transition duration-150 ` +
        `focus:outline-none focus:ring-2 focus:ring-brand-primary ` +
        className
      }
    >
      {children}
    </button>
  );
}
