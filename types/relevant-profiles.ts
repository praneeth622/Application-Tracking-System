export interface RelevantProfile {
  jobId: string
  relevantProfiles: Array<{
    resumeId: string
    name: string
    matchPercentage: number
    matchingSkills: string[]
    missingRequirements: string[]
    experienceMatch: boolean
    educationMatch: boolean
    overallAssessment: string
    timestamp: Date
  }>
  createdAt: Date
  updatedAt: Date
}