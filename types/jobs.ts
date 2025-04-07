export interface Job {
    job_id: string
    title: string
    company: string
    location: string
    employment_type: string
    experience_required: string
    salary_range: string
    created_at: Date
    description: string
    status: string
    total_applications: number
    shortlisted: number
    rejected: number
    in_progress: number
    benefits: string[]
    requirements: string[]
    skills_required: string[]
    working_hours?: string
    mode_of_work?: string
    key_responsibilities?: string[]
    nice_to_have_skills?: string[]
    about_company?: string
    deadline?: string
    metadata: {
      created_by: string
      created_by_id?: string
      last_modified_by: string
    }
    assigned_recruiters?: string[]
  }
  
  