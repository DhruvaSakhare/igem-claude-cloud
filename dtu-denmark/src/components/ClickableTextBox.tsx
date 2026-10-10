import "./ClickableTextBox.css";
import { ReactNode, useEffect, useState } from "react";

interface ClickableTextBoxProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  openAll?: boolean;
}

export const ClickableTextBox = ({
  title,
  children,
  defaultOpen = false,
  openAll,
}: ClickableTextBoxProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Whenever the parent changes openAll, update this textbox
  useEffect(() => {
    if (openAll !== undefined) {
      setIsOpen(openAll);
    }
  }, [openAll]);

  return (
    <div className="clickable-textbox">
      <button
        className="clickable-textbox-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2>{title}</h2>

        <span
          className={`pi pi-chevron-down arrow ${isOpen ? "open" : ""}`}
        ></span>
      </button>

      {isOpen && <div className="clickable-textbox-content">{children}</div>}
    </div>
  );
};

/* OpenAll button */
interface ClickableTextBoxToggleProps {
  open: boolean;
  onClick: () => void;
}

export function ClickableTextBoxToggle({
  open,
  onClick,
}: ClickableTextBoxToggleProps) {
  return (
    <button className="clickable-textbox-toggle" onClick={onClick}>
      {open ? "Close all" : "Open all"}
    </button>
  );
}
