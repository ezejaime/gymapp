import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function Select({ children, className = "", id, label, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-black" htmlFor={selectId}>
      {label}
      <select
        className={`min-h-11 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-black outline-none transition focus:border-black ${className}`}
        id={selectId}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
