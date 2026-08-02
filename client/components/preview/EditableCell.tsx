"use client";

interface Props {
  value: string;
  type?: "text" | "time";
  modified?: boolean;
  onChange: (value: string) => void;
}

export default function EditableCell({
  value,
  type = "text",
  modified = false,
  onChange,
}: Props) {

  

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        h-11
        w-full
        rounded-lg
        border
        px-4
        py-2.5
        text-sm
        text-white
        outline-none

        [color-scheme:dark]

        ${
          modified
            ? `
              border-yellow-400/70
              bg-yellow-500/10
              shadow-[0_0_15px_rgba(250,204,21,0.35)]
            `
            : `
              border-white/10
              bg-black/40
            `
        }

        focus:border-emerald-400
        focus:ring-1
        focus:ring-emerald-400
      `}
    />
  );
}