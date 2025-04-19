"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
  } from "@/components/ui/breadcrumb"
import { Clock, ChartBarBig, Bot } from "lucide-react"

  const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  }
  
  const navMain = [
    {
      title: "Mentors",
      url: "/mentors",
      icon: Clock,
    },
    {
      title: "Freelancers",
      url: "/freelancers",
      icon: ChartBarBig,
    },
    {
      title: "Sessions",
      url: "/sessions",
      icon: ChartBarBig,
    },
    {
      title: "AI Mentor",
      url: "/ai-mentor",
      icon: Bot,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: ChartBarBig,
    },
  ] 

export default function UserLayout({ children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} navMain={navMain}/>
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage></BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
            {children}
        </SidebarInset>
    </SidebarProvider>
  )
}
