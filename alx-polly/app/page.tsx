import { Button } from "@/components/ui/button"
import { Vote, Users, BarChart3, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Polly
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Create engaging polls, gather instant feedback, and make data-driven decisions with ease.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="space-y-3">
              <Vote className="h-12 w-12 text-blue-600 mx-auto" />
              <h3 className="text-lg font-semibold">Easy Poll Creation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create polls in seconds with our intuitive interface
              </p>
            </div>
            <div className="space-y-3">
              <Users className="h-12 w-12 text-indigo-600 mx-auto" />
              <h3 className="text-lg font-semibold">Real-time Results</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Watch votes come in live and see results update instantly
              </p>
            </div>
            <div className="space-y-3">
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto" />
              <h3 className="text-lg font-semibold">Detailed Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get insights with comprehensive analytics and reporting
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mt-12">
            <Button size="lg" asChild>
              <Link href="/polls">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
