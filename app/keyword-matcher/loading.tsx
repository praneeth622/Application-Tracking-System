import { Loader2, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 md:px-8">
        {/* Header Section Loading Skeleton */}
        <div className="mb-8 relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/10 via-violet-400/5 to-blue-500/10 p-4 sm:p-8 border border-violet-200/20 dark:border-violet-800/20 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="h-9 w-60 bg-violet-100/50 dark:bg-violet-800/30 rounded-md animate-pulse"></div>
              <div className="h-4 w-96 mt-3 bg-violet-100/50 dark:bg-violet-800/30 rounded-md animate-pulse"></div>
              <div className="h-4 w-80 mt-2 bg-violet-100/50 dark:bg-violet-800/30 rounded-md animate-pulse"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="h-8 w-36 bg-violet-100/50 dark:bg-violet-800/30 rounded-md animate-pulse"></div>
              <div className="h-8 w-36 bg-violet-100/50 dark:bg-violet-800/30 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Main content with filters and results */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar Skeleton */}
          <div className="md:w-80 flex-shrink-0">
            <Card className="border border-violet-200/50 dark:border-violet-800/50 overflow-hidden shadow-sm">
              <CardContent className="p-0">
                {/* Filter Header */}
                <div className="flex items-center justify-between p-4 border-b border-violet-100 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-900/20">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-violet-500" />
                    <div className="text-base font-semibold text-violet-900 dark:text-violet-100">Smart Filters</div>
                  </div>
                </div>

                <div className="p-4 space-y-5">
                  {/* Search Bar Loading */}
                  <div className="h-9 w-full bg-violet-100/50 dark:bg-violet-800/30 rounded-md animate-pulse"></div>

                  {/* Filter Sections Loading */}
                  <div className="space-y-5 divide-y divide-violet-100 dark:divide-violet-800/50">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="pt-5">
                        <div className="h-5 w-32 mb-3 bg-violet-100/50 dark:bg-violet-800/30 rounded-md animate-pulse"></div>
                        <div className="space-y-2">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="h-6 w-full bg-violet-100/50 dark:bg-violet-800/30 rounded-md animate-pulse"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumes Grid Skeleton */}
          <div className="flex-1">
            {/* Tabs and Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="h-10 w-96 bg-violet-100/50 dark:bg-violet-800/30 rounded-md animate-pulse"></div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-32 bg-violet-100/50 dark:bg-violet-800/30 rounded-md animate-pulse"></div>
                <div className="h-9 w-32 bg-violet-100/50 dark:bg-violet-800/30 rounded-md animate-pulse"></div>
              </div>
            </div>

            {/* Loading indicator */}
            <div className="text-center p-4 mb-6">
              <div className="inline-flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-violet-500 animate-spin mr-2" />
                <span className="text-violet-900 dark:text-violet-100 font-medium">Loading resume data...</span>
              </div>
            </div>

            {/* Resume cards */}
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-5 border border-violet-200/50 dark:border-violet-800/50 animate-pulse">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div>
                      <div className="h-6 w-40 bg-violet-100 dark:bg-violet-800/30 rounded-md mb-3"></div>
                      <div className="flex gap-3">
                        <div className="h-5 w-20 bg-violet-100 dark:bg-violet-800/30 rounded-md"></div>
                        <div className="h-5 w-24 bg-violet-100 dark:bg-violet-800/30 rounded-md"></div>
                      </div>
                    </div>
                    <div className="h-6 w-28 bg-violet-100 dark:bg-violet-800/30 rounded-md"></div>
                  </div>
                  <div className="h-5 w-32 bg-violet-100 dark:bg-violet-800/30 rounded-md mb-2"></div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="h-6 w-16 bg-violet-100 dark:bg-violet-800/30 rounded-md"></div>
                    ))}
                  </div>
                  <div className="border-t border-violet-100 dark:border-violet-800/30 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-28 bg-violet-100 dark:bg-violet-800/30 rounded-md"></div>
                      <div className="flex gap-2">
                        <div className="h-8 w-28 bg-violet-100 dark:bg-violet-800/30 rounded-md"></div>
                        <div className="h-8 w-32 bg-violet-100 dark:bg-violet-800/30 rounded-md"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
  
  