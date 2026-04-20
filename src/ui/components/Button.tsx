import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: Variant;
    size?: Size;
    className?: string;
    disabled?: boolean;

    holdToConfirm?: boolean;
    holdDuration?: number;
};

const base = "bg-green-600 border border-white rounded-full font-bold uppercase transition-colors flex items-center justify-center select-none";

const variants: Record<Variant, string> = {
    primary: "bg-green-600 text-white",
    secondary: "bg-zinc-200 hover:bg-zinc-300",
    ghost: "bg-transparent hover:bg-zinc-200",
    danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizes: Record<Size, string> = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
};

export default function Button({
    children,
    onClick,
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    holdToConfirm = false,
    holdDuration = 3000,
}: Props) {
const [holding, setHolding] = React.useState(false);
const timeoutRef = React.useRef<number | null>(null);

const startHold = () => {
  if (!holdToConfirm || disabled) return;

  setHolding(true);

  timeoutRef.current = window.setTimeout(() => {
    setHolding(false);
    onClick?.();
  }, holdDuration);
};

const cancelHold = () => {
  setHolding(false);

  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }
};

    return (
        <button
            disabled={disabled}
            onMouseDown={holdToConfirm ? startHold : onClick}
            onMouseUp={holdToConfirm ? cancelHold : undefined}
            onMouseLeave={holdToConfirm ? cancelHold : undefined}
            onTouchStart={holdToConfirm ? startHold : undefined}
            onTouchEnd={holdToConfirm ? cancelHold : undefined}
            className={`
                relative overflow-hidden
                ${base}
                ${variants[variant]}
                ${sizes[size]}
                ${disabled ? "opacity-50 cursor-default" : "cursor-pointer hover:bg-green-700"}
                ${className}
            `}>
            {holdToConfirm && (
                <div
                    className="absolute left-0 top-0 h-full bg-white/20"
                    style={{
                            width: holding ? "100%" : "0%",
                            transition: holding ? `width ${holdDuration}ms linear` : "none",
                    }}
                />
            )}
            <span className="relative z-10">{children}</span>
        </button>
    );
}