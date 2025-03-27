import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { CandidateStatus } from '@/app/jobs/[jobId]/candidates/page'

interface HiringStagesState {
  currentView: 'list' | 'board'
  setCurrentView: (view: 'list' | 'board') => void
  statusFilter: CandidateStatus | 'all'
  setStatusFilter: (status: CandidateStatus | 'all') => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const useHiringStages = create<HiringStagesState>()(
  devtools(
    (set) => ({
      currentView: 'list',
      setCurrentView: (view: any) => set({ currentView: view }),
      statusFilter: 'all',
      setStatusFilter: (status: any) => set({ statusFilter: status }),
      searchQuery: '',
      setSearchQuery: (query: any) => set({ searchQuery: query })
    }),
    {
      name: 'hiring-stages-store'
    }
  )
)