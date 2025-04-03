import { FileText, Download, Star, Calendar } from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

interface ResumeCardProps {
//   fileName: string
  candidateName: string
  uploadDate: string
  fileUrl: string
  education?: string
  experience?: number
}

export function ResumeCard({
//   fileName,
  candidateName,
  uploadDate,
  fileUrl,
  education,
  experience,
}: ResumeCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold line-clamp-1">{candidateName}</h3>
            {/* <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
              {fileName}
            </p> */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
              <Calendar className="w-4 h-4" />
              <span>{uploadDate}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={fileUrl} download>
            <Download className="w-4 h-4 mr-2" />
            View File
          </a>
        </Button>
      </div>

      <div className="mt-4 flex items-center space-x-4 text-sm text-muted-foreground">
        {education && (
          <span className="flex items-center">
            <Star className="w-4 h-4 mr-1" />
            {education}
          </span>
        )}
        {experience && (
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {experience} years
          </span>
        )}
      </div>
    </Card>
  )
}