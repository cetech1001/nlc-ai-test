import {HTMLAttributes} from "react";
import { cn } from "../../utils"

export const Skeleton = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-800/50", className)}
      {...props}
    />
  )
}
