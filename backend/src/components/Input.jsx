import React from 'react';

export default function Input(props) {
  return (
    <input
      {...props}
      className={
        `w-full border border-gray-300 bg-white text-brand-text px-3 py-2 rounded ` +
        `focus:outline-none focus:ring-2 focus:ring-brand-primary ` +
        (props.className || '')
      }
    />
  );
}
