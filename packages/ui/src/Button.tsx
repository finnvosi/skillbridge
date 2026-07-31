import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ children, onPress, variant = 'primary', disabled }: ButtonProps) {
  return (
    <button 
      onClick={onPress}
      disabled={disabled}
      style={{
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: variant === 'primary' ? '#007AFF' : '#f5f5f5',
        color: variant === 'primary' ? '#fff' : '#333',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}