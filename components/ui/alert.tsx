import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "lib/utils"; // Assuming you have a utils file for cn
import { Info, X, CircleAlertIcon } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        faded: "bg-muted/50 text-muted-foreground border-muted",
      },
      color: {
        default: "",
        danger:
          "border-red-500/50 text-red-600 bg-red-600/15 dark:border-red-500 [&>svg]:text-red-500",
        success:
          "border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-500",
        warning:
          "border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-500",
      },
    },
    defaultVariants: {
      variant: "default",
      color: "default",
    },
  }
);

const Alert = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants> & {
      title?: string;
      description?: string;
      hideIconWrapper?: boolean;
      isClosable?: boolean;
      onClose?: () => void;
    }
>(
  (
    {
      className,
      variant,
      color,
      title,
      description,
      hideIconWrapper,
      isClosable,
      onClose,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, color }), className)}
        {...props}
      >
        {!hideIconWrapper && <Info />}
        <div className="flex gap-2 items-start">
          <div>
            <CircleAlertIcon />
          </div>
          <div className="flex-1">
            {title && (
              <h5 className="mb-1 font-medium leading-none tracking-tight">
                {title}
              </h5>
            )}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
            {children}
          </div>
        </div>
        {isClosable && onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

export { Alert, alertVariants };
