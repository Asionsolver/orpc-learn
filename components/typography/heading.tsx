import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("", {
  variants: {
    as: {
      h1: "text-h1",
      h2: "text-h2",
      h3: "text-h3",
      h4: "text-h4",
      h5: "text-h5",
      h6: "text-h6",
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
  },
  defaultVariants: {
    color: "primary",
    as: "h1",
    align: "left",
  },
});

export type HeadingProps = {
  children: ReactNode;
  className?: string;
} & VariantProps<typeof headingVariants> &
  Omit<HTMLAttributes<HTMLHeadElement>, "color">;

const Heading = ({
  children,
  as = "h1",
  color,
  align,
  className,
  ...props
}: HeadingProps) => {
  const Components = as as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <Components
      className={cn(headingVariants({ as, color, align }), className)}
      {...props}
    >
      {children}
    </Components>
  );
};

export default Heading;
