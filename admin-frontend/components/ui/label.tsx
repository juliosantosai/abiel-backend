import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const labelVariants = cva("text-sm font-medium text-slate-700", {
  variants: {
    variant: {
      default: "",
      secondary: "text-slate-500"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>((props, ref) => {
  const { className, variant, ...rest } = props;
  return <label className={labelVariants({ variant, className })} ref={ref} {...rest} />;
});
Label.displayName = "Label";

export { Label };
