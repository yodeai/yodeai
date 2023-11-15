import clsx from "clsx";
import { forwardRef } from "react";

interface ButtonProps {
  type: "button" | "submit" | "reset";
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "unstyled";
  disabled?: boolean;
  onClick?: () => void;
}
export default forwardRef(function Button(
  {
    type,
    children,
    className = "",
    onClick,
    variant = "unstyled",
    disabled = false,
  }: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={clsx(
        "flex items-center gap-1",
        variant !== "unstyled" && "text-sm rounded py-1 px-3 font-semibold",
        variant === "secondary" && "border",
        variant === "primary" && "bg-blue-600 text-white shadow-sm",
        disabled && "opacity-50 cursor-not-allowed",  // add this line
        className
      )}
    >
      {children}
    </button>

  );
});