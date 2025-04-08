import * as React from "react"

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div className={`container mx-auto px-4 py-8 max-w-6xl ${className}`} {...props}>
      {children}
    </div>
  )
}