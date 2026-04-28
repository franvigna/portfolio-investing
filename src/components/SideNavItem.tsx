"use client";

export function SideNavItem({
  icon,
  label,
  active = false,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left select-none ${
        active ? "bg-violet-600/20 text-violet-300" : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <span className={`flex-shrink-0 ${active ? "text-violet-400" : ""}`}>{icon}</span>
      {label}
    </button>
  );
}
