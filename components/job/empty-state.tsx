"use client"

import { Briefcase, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  hasFilters: boolean
  onCreateJob: () => void
}

export function EmptyState({ hasFilters, onCreateJob }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="bg-muted/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Briefcase className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        {hasFilters ? "Try adjusting your filters or search query" : "Start by creating your first job posting"}
      </p>
      {!hasFilters && (
        <Button onClick={onCreateJob} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Create New Job
        </Button>
      )}
    </div>
  )
}

