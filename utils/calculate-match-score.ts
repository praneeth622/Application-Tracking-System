export function calculateMatchScore(resumeData: any, jobData: any) {
  let score = 0
  let totalCriteria = 0

  // Skills match
  const requiredSkills = jobData.skills_required || []
  const candidateSkills = resumeData.skills || []
  
  const skillsMatch = requiredSkills.filter((skill: string) => 
    candidateSkills.some((candidateSkill: string) => 
      candidateSkill.toLowerCase().includes(skill.toLowerCase())
    )
  ).length

  score += (skillsMatch / requiredSkills.length) * 40 // Skills worth 40%
  totalCriteria += 1

  // Experience match
  const requiredExperience = parseInt(jobData.experience_required) || 0
  const candidateExperience = resumeData.experience || 0
  
  if (candidateExperience >= requiredExperience) {
    score += 30 // Experience worth 30%
  }
  totalCriteria += 1

  // Education match (if specified)
  if (jobData.education_required) {
    const educationMatch = resumeData.education.some((edu: { degree: string }) => 
      edu.degree.toLowerCase().includes(jobData.education_required.toLowerCase())
    )
    if (educationMatch) {
      score += 30 // Education worth 30%
    }
    totalCriteria += 1
  }

  return Math.round((score / totalCriteria))
}
