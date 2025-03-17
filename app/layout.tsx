import type { Metadata } from 'next'
import { Roboto, Open_Sans } from 'next/font/google'
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/auth-context"
import { FirebaseProvider } from "@/components/providers/firebase-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"



export const metadata: Metadata = {
  title: 'ATS Resume Tracker',
  description: 'ATS Resume Tracker',
  generator: 'ats.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={``}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
