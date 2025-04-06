"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"

interface SortDropdownProps {
  sortOption: string
  isSortDropdownOpen: boolean
  setIsSortDropdownOpen: (isOpen: boolean) => void
  setSortOption: (option: string) => void
}

export function SortDropdown({
  sortOption,
  isSortDropdownOpen,
  setIsSortDropdownOpen,
  setSortOption,
}: SortDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false)
      }
    }

    // Close on escape key press
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSortDropdownOpen(false)
      }
    }

    // Only add listeners if dropdown is open
    if (isSortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscapeKey)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isSortDropdownOpen, setIsSortDropdownOpen])

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    setSortOption(option)
    setIsSortDropdownOpen(false)
  }

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsSortDropdownOpen(!isSortDropdownOpen)
  }

  return (
    <div className="relative z-20" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 border-violet-200 dark:border-violet-800"
        onClick={toggleDropdown}
      >
        <BarChart3 className="w-4 h-4 text-violet-500" />
        <span>
          Sort: {sortOption === "relevance" ? "Relevance" : sortOption === "recent" ? "Recent" : "Experience"}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform duration-200 ${isSortDropdownOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>

      {isSortDropdownOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-violet-200 dark:border-violet-800 z-50 overflow-hidden">
          <div
            className={`px-4 py-2 cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 ${sortOption === "relevance" ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" : ""}`}
            onClick={() => handleOptionSelect("relevance")}
          >
            Relevance
          </div>
          <div
            className={`px-4 py-2 cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 ${sortOption === "recent" ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" : ""}`}
            onClick={() => handleOptionSelect("recent")}
          >
            Most Recent
          </div>
          <div
            className={`px-4 py-2 cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 ${sortOption === "experience" ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" : ""}`}
            onClick={() => handleOptionSelect("experience")}
          >
            Experience Level
          </div>
        </div>
      )}
    </div>
  )
}

