"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ArrowUp, ArrowDown } from "lucide-react";

interface Props {
  value: number;
  modified?: boolean;
  onChange: (value: number) => void;
}

const OPTIONS = [
  { label: "UP", value: 0, icon: ArrowUp },
  { label: "DOWN", value: 1, icon: ArrowDown },
];

export default function DirectionDropdown({ value, modified = false, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selected = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];
  const SelectedIcon = selected.icon;

  return (
    <div ref={rootRef} className="relative w-full overflow-visible">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`
          flex
          h-11
          w-full
          items-center
          justify-between
          gap-3
          rounded-lg
          border
          ${modified ? "border-yellow-400/70 bg-yellow-500/10" : "border-white/10 bg-black/40"}
          px-4
          pr-11
          text-sm
          text-white
          outline-none
          transition
          hover:border-emerald-400/40
          hover:bg-black/55
          focus:border-emerald-400
          focus:ring-1
          focus:ring-emerald-400
        `}
      >
        <span className="flex items-center gap-2 font-medium tracking-wide">
          <SelectedIcon size={15} className="text-emerald-400" />
          {selected.label}
        </span>

        <ChevronDown
          size={16}
          className={`ml-2 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="
            absolute
            left-0
            right-0
            top-[calc(100%+8px)]
            z-30
            overflow-hidden
            rounded-xl
            border
            border-white/10
            bg-slate-950
            p-1
            shadow-[0_20px_60px_rgba(0,0,0,0.45)]
          "
        >
          {OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            const isActive = option.value === value;

            return (
              <button
                key={option.label}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`
                  flex
                  w-full
                  items-center
                  gap-2
                  rounded-lg
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  transition
                  ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-slate-200 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <OptionIcon size={15} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}