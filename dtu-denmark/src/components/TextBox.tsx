import "./TextBox.css";
import { ReactNode, ElementType, ComponentPropsWithoutRef } from "react";

type TextBoxProps<T extends ElementType = "div"> = {
  children: ReactNode;
  as?: T;
  className?: string;
} & ComponentPropsWithoutRef<T>;

export const TextBox = <T extends ElementType = "div">({
  children,
  as,
  className = "",
  ...props
}: TextBoxProps<T>) => {
  const Component = as || "div";

  return (
    <Component className={`text-box ${className}`} {...props}>
      {children}
    </Component>
  );
};
