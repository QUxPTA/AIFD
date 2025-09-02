"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  PlusCircle, 
  Vote, 
  User,
  Home
} from "lucide-react"

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "All Polls",
    href: "/polls",
    icon: Vote,
  },
  {
    name: "My Polls",
    href: "/my-polls",
    icon: BarChart3,
  },
  {
    name: "Create Poll",
    href: "/create-poll",
    icon: PlusCircle,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Polly</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive && "bg-secondary"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          )
        })}
      </nav>
      
      {/* User section */}
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start">
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>
      </div>
    </div>
  )
}
