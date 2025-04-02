export interface UserProfile {
  uid: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'user' | 'admin'