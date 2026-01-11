import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("", {
  variants: {
    as: {
      h1: "text-h1! leading-h1",
      h2: "text-h2! leading-h2",
      h3: "text-h3! leading-h3",
      h4: "text-h4! leading-h4",
      h5: "text-h5! leading-h5",
      h6: "text-h6! leading-h6 ",
    },
    color: {
      primary: "text-text-primary",
      secondary: "text-text-secondary",
      tertiary: "text-text-tertiary",
    },
    align: {
      left: "text-left",
      right: "text-right",
      center: "text-center",
    },
    weight: {
      bold: "font-bold",
      semibold: "font-semibold",
      medium: "font-medium",
      regular: "font-regular",
    },
  },
  defaultVariants: {
    color: "primary",
    as: "h1",
    align: "left",
    weight: "regular",
  },
});

export type HeadingProps = {
  children: ReactNode;
  className?: string;
} & VariantProps<typeof headingVariants> &
  Omit<HTMLAttributes<HTMLHeadElement>, "color">;

export const Heading = ({
  children,
  as = "h1",
  color,
  align,
  weight,
  className,
  ...props
}: HeadingProps) => {
  const Components = as as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <Components
      className={cn(headingVariants({ as, color, align, weight }), className)}
      {...props}
    >
      {children}
    </Components>
  );
};
