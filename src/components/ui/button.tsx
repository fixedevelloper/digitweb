import * as React from "react";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyle = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors px-4 py-2 disabled:opacity-50";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50"
  };
  return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />;
}
