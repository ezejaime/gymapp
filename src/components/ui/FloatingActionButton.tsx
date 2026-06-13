import type { ButtonHTMLAttributes } from "react";

export function FloatingActionButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`fixed bottom-5 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full border border-black bg-black text-3xl leading-none text-white shadow-sm transition hover:bg-neutral-800 ${className}`}
      type="button"
      {...props}
    />
  );
}
