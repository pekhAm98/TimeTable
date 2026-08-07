"use client";

import { useEffect, useState } from "react";

interface Props {
  value: string;
  type?: "text" | "time";
  modified?: boolean;
  onBlur: (value: string) => void;
  new?: boolean;
}

export default function EditableCell({
  value,
  type = "text",
  modified = false,
  onBlur,
  new: isNew = false,
}: Props) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <input
      type={type}
      step={type === "time" ? 1 : undefined}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => onBlur(localValue)}
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
            : isNew
              ? `
                border-green-400/70
                bg-green-500/10
                shadow-[0_0_15px_rgba(34,197,94,0.35)]
              `
              : `
                border-white/10
                bg-black/40
                hover:bg-white/5
              `
        }

        focus:border-emerald-400
        focus:ring-1
        focus:ring-emerald-400
      `}
    />
  );
}