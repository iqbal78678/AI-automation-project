"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";

export interface TextShimmerProps {
  children: string;
  className?: string;
  duration?: number;
}

// Dependency-free shimmer text: an animated gradient sweep over muted text.
const ShimmerComponent = ({
  children,
  className,
  duration = 2,
}: TextShimmerProps) => (
  <span
    className={cn(
      "inline-block animate-pulse text-muted-foreground",
      className,
    )}
    style={{ animationDuration: `${duration}s` }}
  >
    {children}
  </span>
);

export const Shimmer = memo(ShimmerComponent);
