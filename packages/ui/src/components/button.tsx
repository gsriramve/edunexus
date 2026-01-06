/**
 * Button Component
 * Placeholder - will be replaced with shadcn/ui Button
 */

import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
