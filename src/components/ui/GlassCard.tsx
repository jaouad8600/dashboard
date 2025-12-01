import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "bg-white/70 backdrop-blur-md border border-white/20 shadow-sm rounded-2xl transition-all duration-300",
                hoverEffect && "hover:shadow-lg hover:scale-[1.02] hover:bg-white/80",
                className
            )}
            style={{
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.05)",
            }}
            {...props}
        >
            {children}
        </div>
    );
}
