export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left side - Authentication forms */}
        <div className="flex-1 flex items-center justify-center p-4">
          {children}
        </div>
        
        {/* Right side - Branding/Hero section */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-muted">
          <div className="mx-auto max-w-md text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome to Polly
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Create and share polls with ease. Get instant feedback from your audience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
