import clsx from "clsx";
import { ElementType } from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
}
export default function Container({
  children,
  className,
  as = "div",
}: ContainerProps) {
  const Component = as;

  return (
    <Component className={clsx("container mx-auto px-2", className)}>
      {children}
    </Component>
  );
}