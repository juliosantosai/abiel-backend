import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        ghost: "bg-transparent border-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, variant, ...rest } = props;
  return <input className={inputVariants({ variant, className })} ref={ref} {...rest} />;
});
Input.displayName = "Input";

export { Input, inputVariants };
