import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: Option[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CustomSelect({ value, options, placeholder, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className={`custom-select${disabled ? " disabled" : ""}`} ref={ref}>
      <button
        type="button"
        className={`custom-select-trigger${open ? " open" : ""}${!value ? " placeholder" : ""}`}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
      >
        {selectedLabel}
      </button>
      {open && (
        <ul className="custom-select-menu">
          <li
            className={`custom-select-option${!value ? " selected" : ""}`}
            onClick={() => { onChange(""); setOpen(false); }}
          >
            {placeholder}
          </li>
          {options.map((o) => (
            <li
              key={o.value}
              className={`custom-select-option${o.value === value ? " selected" : ""}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
