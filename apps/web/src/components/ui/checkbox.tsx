'use client';

import * as React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', checked, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={handleChange}
        className={`h-5 w-5 rounded border-2 border-black bg-white accent-purple-600 focus:ring-2 focus:ring-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${className}`}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';
