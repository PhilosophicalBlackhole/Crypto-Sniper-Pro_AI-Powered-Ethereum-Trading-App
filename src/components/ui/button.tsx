/**
 * Button (Shadcn-compatible)
 * - Provides Button component and buttonVariants (required by other Shadcn UI pieces).
 * - Styled for the app's slate/blue theme.
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * buttonVariants
 * - Class variance map for common button variants and sizes.
 * - Outline variant intentionally includes bg-transparent as per project rule.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-slate-950',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        outline:
          'bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-slate-500',
        secondary:
          'bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-600',
        ghost:
          'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white',
        link:
          'bg-transparent underline-offset-4 text-blue-400 hover:underline hover:text-blue-300',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * ButtonProps
 * - Extends native button props with variant/size and optional asChild for composition.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child (Radix Slot) to compose with links or other elements */
  asChild?: boolean;
}

/**
 * Button component
 * - Applies buttonVariants and forwards ref.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
