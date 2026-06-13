import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ className = "", id, label, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-black" htmlFor={inputId}>
      {label}
      <input
        className={`w-full min-h-12 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-black outline-none transition placeholder:text-neutral-400 focus:border-black ${className}`}
        id={inputId}
        {...props}
      />
    </label>
  );
}
