import { Skeleton } from "@/components/ui/skeleton"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { JobCardSkeleton } from "@/components/job/job-card-skeleton"

export default function JobLoading() {
  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar isOpen={false} setIsOpen={() => {}} />

      <div className="flex-1 min-h-screen ml-[4.5rem]">
        <div className="container mx-auto py-8 px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>

          <Skeleton className="h-16 w-full mb-6 rounded-lg" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

