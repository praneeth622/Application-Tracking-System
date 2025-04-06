"use client"

import { Checkbox } from "./ui/checkbox"
import { type ReactNode, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FilterSectionProps {
  title: string
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
  icon?: ReactNode
}

export function FilterSection({ title, items, selected, onToggle, icon }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAll, setShowAll] = useState(false)

  // Show only 5 items initially, unless showAll is true
  const displayItems = showAll ? items : items.slice(0, 5)
  const hasMoreItems = items.length > 5

  return (
    <div className="space-y-3">
      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-sm text-violet-700 dark:text-violet-300 uppercase tracking-wide group-hover:text-violet-900 dark:group-hover:text-violet-100 transition-colors">
            {title}
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-violet-500 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-violet-500 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors" />
        )}
      </div>

      {isExpanded && (
        <>
          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
            {displayItems.length > 0 ? (
              displayItems.map((item) => (
                <div key={item} className="flex items-center space-x-2 group">
                  <Checkbox
                    id={`${title}-${item}`}
                    checked={selected.includes(item)}
                    onCheckedChange={() => onToggle(item)}
                    className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 border-violet-200 dark:border-violet-800"
                  />
                  <label
                    htmlFor={`${title}-${item}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed 
                      peer-disabled:opacity-70 cursor-pointer group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors"
                  >
                    {item}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground italic">No {title.toLowerCase()} found</div>
            )}
          </div>

          {hasMoreItems && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowAll(!showAll)
              }}
              className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium"
            >
              {showAll ? "Show less" : `Show all ${items.length} options`}
            </button>
          )}
        </>
      )}
    </div>
  )
}

