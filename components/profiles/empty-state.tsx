"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useRouter } from "next/navigation"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel: string
  actionHref: string
  icon?: keyof typeof Icons
}

export function EmptyState({ title, description, actionLabel, actionHref, icon = "file" }: EmptyStateProps) {
  const router = useRouter()
  const Icon = Icons[icon]

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      <Button onClick={() => router.push(actionHref)}>{actionLabel}</Button>
    </div>
  )
}

