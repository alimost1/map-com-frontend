import { forwardRef } from 'react';

export const Card = forwardRef(function Card({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = forwardRef(function CardHeader({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`px-6 py-4 border-b border-dark-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef(function CardContent({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef(function CardFooter({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`px-6 py-4 bg-dark-50 border-t border-dark-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';