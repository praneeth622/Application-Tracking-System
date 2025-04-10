# ATS (Application Tracking System)

A modern, AI-powered Application Tracking System built with Next.js 14, featuring resume parsing, keyword matching, and candidate management.


## 🌟 Live Demo

- Frontend: [https://application-tracking-system-production-b126.up.railway.app/](https://application-tracking-system-production-b126.up.railway.app/)
- Backend API: [https://ats-backend-production-2143.up.railway.app/](https://ats-backend-production-2143.up.railway.app/)

## 📋 Detailed Features

### 1. Resume Processing & Analysis
- **Smart Upload System**
  - Drag-and-drop interface
  - Multi-file upload support
  - Progress tracking
  - File type validation (PDF, DOCX, DOC)
  - Duplicate detection using SHA-256 hashing
  - Automatic file organization

- **AI-Powered Analysis**
  - Experience extraction
  - Skills identification
  - Education history parsing
  - Key achievements recognition
  - Career progression analysis
  - Technology stack identification

- **Keyword Matching**
  - Job description matching
  - Skills gap analysis
  - Experience level matching
  - Industry relevance scoring
  - Custom keyword sets

### 2. Candidate Management
- **Profile Management**
  - Detailed candidate profiles
  - Resume version history
  - Contact information
  - Skills matrix
  - Experience timeline
  - Education history

- **Assessment System**
  - Automated scoring
  - Custom evaluation criteria
  - Interview feedback tracking
  - Performance metrics
  - Comparative analysis

### 3. Vendor Management
- **Vendor Profiles**
  - Vendor registration
  - Performance tracking
  - Document management
  - Communication history
  - Rating system

- **Integration Features**
  - API access management
  - Custom data mapping
  - Automated notifications
  - Report generation

### 4. Administrative Features
- **User Management**
  - Role-based access control
  - User activity logging
  - Permission management
  - Team collaboration tools

- **System Configuration**
  - Custom fields setup
  - Workflow configuration
  - Email template management
  - Integration settings

## 🏗 Tech Stack

### Frontend
- Next.js 14 (App Router)
- React with TypeScript
- Tailwind CSS for styling
- Shadcn/UI components
- Framer Motion for animations
- Firebase Authentication

### Backend
- Express.js with TypeScript
- MongoDB with Mongoose
- AWS S3 for file storage
- Google Gemini AI for resume analysis

### Infrastructure
- Vercel (Frontend hosting)
- Render (Backend hosting)
- MongoDB Atlas (Database)
- AWS S3 (File storage)

## 📁 Detailed Project Structure

```plaintext
├── app/
│   ├── (auth)/                    # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/               # Dashboard routes
│   │   ├── profiles/
│   │   ├── upload-resume/
│   │   └── keyword-matcher/
│   ├── (admin)/                   # Admin routes
│   │   ├── users/
│   │   ├── settings/
│   │   └── analytics/
│   └── api/                       # API routes
├── components/
│   ├── ui/                        # Base UI components
│   │   ├── button/
│   │   ├── dialog/
│   │   ├── dropdown/
│   │   └── forms/
│   ├── dashboard/                 # Dashboard components
│   │   ├── sidebar/
│   │   ├── header/
│   │   └── navigation/
│   ├── resume/                    # Resume related components
│   │   ├── upload/
│   │   ├── preview/
│   │   └── analysis/
│   ├── profiles/                  # Profile components
│   │   ├── card/
│   │   ├── details/
│   │   └── editor/
│   └── shared/                    # Shared components
├── lib/
│   ├── api/                       # API client
│   ├── auth/                      # Authentication utilities
│   ├── database/                  # Database utilities
│   └── validators/                # Form validators
├── hooks/
│   ├── use-auth.ts
│   ├── use-profiles.ts
│   ├── use-upload.ts
│   └── use-vendors.ts
├── context/
│   ├── auth-context.tsx
│   ├── theme-context.tsx
│   └── upload-context.tsx
├── utils/
│   ├── api-helpers.ts
│   ├── date-helpers.ts
│   ├── file-helpers.ts
│   └── validation-helpers.ts
├── styles/
│   ├── globals.css
│   └── themes/
├── types/
│   ├── auth.ts
│   ├── profile.ts
│   ├── resume.ts
│   └── vendor.ts
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
└── config/
    ├── constants.ts
    ├── api-config.ts
    └── site-config.ts
```

## 🔧 Core Technologies & Integration

### Frontend Architecture
- **Next.js 14 with App Router**
  - Server components
  - Client components
  - API routes
  - Middleware
  - Dynamic routing

- **State Management**
  - React Context
  - Custom hooks
  - Local storage
  - Session management

- **UI/UX**
  - Tailwind CSS
  - Shadcn/UI components
  - Framer Motion animations
  - Responsive design
  - Dark/Light themes

### Backend Services
- **Express.js API**
  - RESTful endpoints
  - Authentication middleware
  - File processing
  - Error handling
  - Rate limiting

- **Database**
  - MongoDB schemas
  - Indexes
  - Aggregation pipelines
  - Caching
  - Backup systems

### Cloud Services
- **AWS Integration**
  - S3 for file storage
  - CloudFront for CDN
  - IAM for security
  - Lambda functions

- **Firebase Services**
  - Authentication
  - Real-time updates
  - Cloud messaging
  - Analytics

### AI & Machine Learning
- **Google Gemini AI**
  - Resume parsing
  - Text analysis
  - Pattern recognition
  - Recommendation engine

## 🚀 Development & Deployment

### Development Environment
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Build production
npm run build
```

### Environment Variables
```env
# Frontend
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_FIREBASE_CONFIG=
NEXT_PUBLIC_GEMINI_API_KEY=

# Backend
MONGODB_URI=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
JWT_SECRET=
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Build optimization
- [ ] Security headers
- [ ] SSL certificates
- [ ] Database backup
- [ ] Monitoring setup

## 📈 Performance & Security

### Performance Optimization
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies
- CDN integration

### Security Measures
- JWT authentication
- CORS policies
- Rate limiting
- Input validation
- File scanning
- XSS protection

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

