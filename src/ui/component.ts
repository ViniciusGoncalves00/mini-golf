type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const rounded = "rounded-full";
const border = "border border-white";
const base = `bg-green-600 ${border} ${rounded} font-bold uppercase transition-colors flex items-center justify-center select-none`;

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

export interface ButtonParams {
    text: string;
    onClick: () => void;
    parent: HTMLElement
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    holdToConfirm?: boolean;
    holdDuration?: number;
}

export class Button {
    public static create(params: ButtonParams): HTMLButtonElement {
        const {
            text,
            onClick,
            parent,
            variant = "primary",
            size = "md",
            disabled = false,
            holdToConfirm = false,
            holdDuration = 3000,
        } = params;

        const button = document.createElement("button");
        button.textContent = text;
        button.disabled = disabled;

        let isHolding = false;
        let holdTimeout: number | null = null;
        let progress: HTMLDivElement | null = null;

        if (holdToConfirm) {
            progress = document.createElement("div");
            progress.className = "absolute left-0 top-0 h-full bg-white/20";
            progress.style.width = "0%";
            progress.style.transition = "none";
            button.appendChild(progress);
        }

        const startHold = () => {
            if (!holdToConfirm || disabled) return;

            isHolding = true;

            if (progress) {
                progress.style.transition = "none";
                progress.style.width = "0%";

                requestAnimationFrame(() => {
                    if (!progress) return;
                
                    progress.style.transition = `width ${holdDuration}ms linear`;
                    progress.style.width = "100%";
                });
            }

            holdTimeout = window.setTimeout(() => {
                isHolding = false;
                if (progress) {
                    progress.style.width = "0%";
                    progress.style.transition = "none";
                }
                onClick?.();
            }, holdDuration);
        };

        const cancelHold = () => {
            isHolding = false;

            if (holdTimeout) {
                clearTimeout(holdTimeout);
                holdTimeout = null;
            }

            if (progress) {
                progress.style.transition = "none";
                progress.style.width = "0%";
            }
        };

        button.onmousedown = holdToConfirm ? startHold : onClick;
        button.onmouseup = holdToConfirm ? cancelHold : null;
        button.onmouseleave = holdToConfirm ? cancelHold : null;
        button.ontouchstart = holdToConfirm ? startHold : null;
        button.ontouchend = holdToConfirm ? cancelHold : null;
        button.ontouchcancel = holdToConfirm ? cancelHold : null;

        button.className = `
            relative overflow-hidden
            ${base}
            ${variants[variant]}
            ${sizes[size]}
            ${disabled ? "opacity-50 cursor-default" : "cursor-pointer hover:bg-green-700"
        }`;

        if (!holdToConfirm) button.addEventListener("click", onClick);
        parent.appendChild(button);

        return button;
    }
}