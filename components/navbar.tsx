import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, BarChart2, Database, Settings, Search } from "lucide-react"

export function Navbar() {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-semibold text-lg">
            Williams-Sonoma FAQ Assistant
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
          </Link>
          <Link href="/evaluation">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Evaluation
            </Button>
          </Link>
          <Link href="/browse">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Admin
            </Button>
          </Link>
          <Link href="/setup">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Setup
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
