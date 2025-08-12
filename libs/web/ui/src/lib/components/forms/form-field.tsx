'use client'

import * as React from "react";
import { cn } from "../../utils";
import { Label } from "../primitives";

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required, children, className, ...props }, ref) => {
    const childId = React.useId();

    const childWithProps = React.cloneElement(children, {
      // @ts-ignore
      id: childId,
      className: cn(
        // @ts-ignore
        children.props?.className,
        error && "border-red-500 focus:border-red-500"
      ),
      "aria-invalid": !!error,
      "aria-describedby": error ? `${childId}-error` : undefined,
    });

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <Label htmlFor={childId} className="text-white text-sm font-medium">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </Label>
        )}
        {childWithProps}
        {error && (
          <p id={`${childId}-error`} className="text-red-400 text-sm">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };
