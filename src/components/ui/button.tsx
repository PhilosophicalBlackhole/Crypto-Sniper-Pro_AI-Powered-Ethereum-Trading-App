/**
 * Button (shadcn-compatible)
 * - Exports Button component and buttonVariants for consistent styling.
 * - This matches the expected API so other components can import { buttonVariants }.
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * buttonVariants
 * Style variants/sizes for Button using class-variance-authority.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-slate-900 text-white hover:bg-slate-900/90',
        destructive: 'bg-red-600 text-white hover:bg-red-600/90',
        outline: 'border border-slate-700 text-slate-200 hover:bg-slate-800/40',
        secondary: 'bg-slate-700 text-white hover:bg-slate-700/90',
        ghost: 'hover:bg-slate-800 hover:text-slate-100',
        link: 'text-blue-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

/**
 * ButtonProps
 * - Extends native button props with variant/size and "asChild" support.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child (for polymorphic Slot usage) */
  asChild?: boolean
}

/**
 * Button
 * - Polymorphic button using Radix Slot when asChild is true.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export default Button