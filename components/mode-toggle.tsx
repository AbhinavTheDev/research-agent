"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";

import { cn } from "lib/utils";
import { useTheme } from "@/utils/theme-provider";

const themes = [
  {
    key: "light",
    label: "Light theme",
    icon: SunIcon,
  },
  {
    key: "dark",
    label: "Dark theme",
    icon: MoonIcon,
  },
  {
    key: "system",
    label: "System theme",
    icon: MonitorIcon,
  },
];

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const toggleTheme = (key: string) => {
    if (key === "light") setTheme("dark");
    if (key === "dark") setTheme("light");
  };
  return (
    <div
      className={cn(
        "relative isolate flex items-center rounded-md p-1 size-6",
        className,
      )}
    >
      <button
        className="size-full cursor-pointer rounded-full bg-black p-0 transition-all duration-300 active:scale-95"
        onClick={() => toggleTheme(theme)}
        type="button"
      >
        <span className="sr-only">Toggle theme</span>
        <svg
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.g
            animate={{ rotate: isDark ? -180 : 0 }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
          >
            <path
              d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5"
              fill="#ced4bf"
            />
            <path
              d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5"
              fill="black"
            />
          </motion.g>
          <motion.path
            animate={{ rotate: isDark ? 180 : 0 }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
            d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
            fill="#ced4bf"
          />
        </svg>
      </button>
    </div>
  );
}
