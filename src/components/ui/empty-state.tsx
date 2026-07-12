import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-8 text-center animate-in fade-in-50 duration-500",
        className
      )}
      {...props}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800/50 mb-4 shadow-inner">
        <Icon className="h-8 w-8 text-zinc-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-zinc-200 mb-1 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
