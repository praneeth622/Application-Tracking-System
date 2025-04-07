import type { Candidate } from "@/app/jobs/[jobId]/candidates/page"

// Function to calculate similarity score between two candidates
const calculateSimilarity = (candidate1: Candidate, candidate2: Candidate): number => {
  let score = 0

  // Check name similarity (case insensitive)
  if (candidate1.name.toLowerCase() === candidate2.name.toLowerCase()) {
    score += 0.4
  }

  // Check email similarity (case insensitive)
  if (candidate1.email.toLowerCase() === candidate2.email.toLowerCase()) {
    score += 0.4
  }

  // Check skills similarity
  const skills1 = new Set(candidate1.analysis.key_skills.map((s) => s.toLowerCase()))
  const skills2 = new Set(candidate2.analysis.key_skills.map((s) => s.toLowerCase()))

  // Calculate Jaccard similarity for skills
  const intersection = new Set([...skills1].filter((x) => skills2.has(x)))
  const union = new Set([...skills1, ...skills2])

  if (union.size > 0) {
    const skillSimilarity = intersection.size / union.size
    score += skillSimilarity * 0.2
  }

  return score
}

// Function to filter out duplicate candidates
export const filterDuplicateCandidates = (candidates: Candidate[]): Candidate[] => {
  const uniqueCandidates: Candidate[] = []
  const similarityThreshold = 0.7 // Threshold to consider candidates as duplicates

  // Sort by match percentage to keep the highest matching candidates
  const sortedCandidates = [...candidates].sort(
    (a, b) => b.matchAnalysis.matchPercentage - a.matchAnalysis.matchPercentage,
  )

  for (const candidate of sortedCandidates) {
    // Check if this candidate is similar to any already added candidate
    const isDuplicate = uniqueCandidates.some(
      (uniqueCandidate) => calculateSimilarity(candidate, uniqueCandidate) >= similarityThreshold,
    )

    if (!isDuplicate) {
      uniqueCandidates.push(candidate)
    }
  }

  return uniqueCandidates
}

