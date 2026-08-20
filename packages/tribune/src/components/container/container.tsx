import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import "./container.css";

const containerVariants = cva("tbn-container", {
  defaultVariants: {
    gutter: true,
    size: "content",
  },
  variants: {
    gutter: {
      false: "",
      outside: "tbn-container--gutter-outside",
      true: "tbn-container--gutter",
    },
    size: {
      content: "tbn-container--content",
      full: "tbn-container--full",
      measure: "tbn-container--measure",
      narrow: "tbn-container--narrow",
      wide: "tbn-container--wide",
    },
  },
});

type ContainerProps = React.ComponentPropsWithRef<"div"> &
  VariantProps<typeof containerVariants>;

export function Container({
  size,
  gutter,
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(containerVariants({ gutter, size }), className)}
      data-slot="container"
      {...props}
    >
      {children}
    </div>
  );
}

export type { ContainerProps };
