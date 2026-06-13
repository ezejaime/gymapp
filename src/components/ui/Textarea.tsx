import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function Textarea({ className = "", id, label, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-black" htmlFor={textareaId}>
      {label}
      <textarea
        className={`min-h-32 resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-black outline-none transition placeholder:text-neutral-400 focus:border-black ${className}`}
        id={textareaId}
        {...props}
      />
    </label>
  );
}
