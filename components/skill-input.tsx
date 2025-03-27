"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

interface SkillInputProps {
  skills: string[]
  setSkills: (skills: string[]) => void
}

export function SkillInput({ skills, setSkills }: SkillInputProps) {
  const [input, setInput] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      if (!skills.includes(input.trim())) {
        setSkills([...skills, input.trim()])
      }
      setInput("")
    }
  }

  const handleAddSkill = () => {
    if (input.trim() && !skills.includes(input.trim())) {
      setSkills([...skills, input.trim()])
      setInput("")
      inputRef.current?.focus()
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Add a skill..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button 
          type="button"
          onClick={handleAddSkill}
          disabled={!input.trim()}
        >
          Add
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="hover:text-primary/80"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}